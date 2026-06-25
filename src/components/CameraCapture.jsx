import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

/*
  Webcam capture flow for the "press the shutter, print a polaroid" feature.
  Lives in the DOM (outside the R3F Canvas). Everything is client-side — the
  photo never leaves the browser.

  Two steps:
    choose  -> "Take a selfie" or "Print the default photo"
    camera  -> live preview + shutter

  Pressing the shutter commits immediately: it prints the photo on the 3D model
  and closes the overlay so the eject + develop animation can play. There is no
  longer a 2D "result" popup — the developed polaroid is viewed on the 3D model,
  and the Save / Retake actions live there (beneath the polaroid; see ModelCanvas).

  Contract:
    onCapture(canvas) -> a square, selfie-mirrored, graded photo canvas; the caller
                         prints it on the 3D model and keeps it for the Save action.
    onDone()          -> close the overlay and start the eject -> view sequence.
    onUseDefault()    -> print the model's built-in default photo, then close.
    onClose()         -> dismiss the overlay (✕ / backdrop / Escape).
    initialStep       -> "choose" (default) or "camera" (used by Retake to jump
                         straight back to the live camera).
*/

// Source-photo resolution. Portrait 744×1024 to match the polaroid photo plane
// (POLAROID_1) on the 3D model and the live-preview aspect below.
const PRINT_W = 744;
const PRINT_H = 1024;
const PRINT_AR = PRINT_W / PRINT_H;

// DOM preview / saved-file polaroid frame layout (portrait photo + thick instax
// bottom border). This is just for the overlay preview + Save download; the 3D
// model has its own frame mesh.
const CARD_W = 600;
const CARD_MARGIN = 48;            // side + top margin (px)
const CARD_PHOTO_W = CARD_W - 2 * CARD_MARGIN;
const CARD_PHOTO_H = Math.round(CARD_PHOTO_W / PRINT_AR);
const CARD_BOTTOM = 150;           // thick instax bottom border
const CARD_H = CARD_MARGIN + CARD_PHOTO_H + CARD_BOTTOM;

/*
  Instax Mini 12 print emulation.

  The look is baked ONCE here, on the 2D capture canvas, the moment the shutter
  fires — not per video frame and not on the GPU — so it's effectively free and
  the same graded canvas flows to the 3D print (drawDevelop), the saved PNG and
  the result viewer. The goal: warm, slightly soft, gently overexposed with
  rolled-off highlights, lower contrast + saturation, a soft highlight bloom,
  barely-there grain and a whisper of a vignette — clean and modern, NOT vintage.

  All strengths live in GRADE so the look is one tunable place.
*/
const GRADE = {
  // 1. Colour — warm white balance. Instax prints lean warm: lift red, a touch of
  //    green (red+green reads as yellow) and pull blue down. Kept small so skin
  //    tones stay natural rather than turning orange.
  rGain: 1.045,
  gGain: 1.012,
  bGain: 0.95,
  // 2. Exposure — a small lift (≈ +0.14 EV, 2^0.14 ≈ 1.10) for the gently
  //    "slightly overexposed" print brightness.
  exposure: 1.1,
  // 2. Contrast — ~10% softer; values are pulled toward mid-grey.
  contrast: 0.9,
  // 2. Shadow lift — film blacks are never pure black; raise the floor a hair.
  shadowLift: 0.035,
  // 2. Highlight rolloff — a soft shoulder above the knee so highlights compress
  //    (Instax highlight glow) instead of clipping hard to white.
  highlightKnee: 0.75,
  highlightCompress: 2.2,
  // 3. Saturation — ~13% lower, but stop well short of washed-out.
  saturation: 0.87,
  // 7. Grain — extremely fine luminance noise (shared across RGB = filmic, not
  //    coloured speckle). ±~3/255, barely perceptible.
  grain: 0.012,
  // 6. Softness — sub-pixel blur on the source so the print isn't phone-sharp.
  softness: 0.6, // px
  // 4. Bloom — soft, realistic glow on bright areas (not a cinematic flare).
  bloomAlpha: 0.3,
  bloomBlur: 6, // px at full res
  bloomScale: 3, // bright-pass is computed downscaled, for performance
  // 5. Vignette — barely-noticeable edge darkening; the centre stays clean.
  vignette: 0.14,
};

const clamp255 = (c) => (c <= 0 ? 0 : c >= 1 ? 255 : ((c * 255 + 0.5) | 0));

// Per-channel tone curve (2): exposure → contrast → shadow lift → highlight rolloff.
function toneCurve(c) {
  c *= GRADE.exposure; // exposure boost
  c = (c - 0.5) * GRADE.contrast + 0.5; // lower contrast
  c = GRADE.shadowLift + c * (1 - GRADE.shadowLift); // lift blacks off zero
  const k = GRADE.highlightKnee;
  if (c > k) c = k + (c - k) / (1 + (c - k) * GRADE.highlightCompress); // soft shoulder
  return c;
}

// One pixel pass: warm WB (1), tone curve (2), desaturation (3) and grain (7).
// Single pass over the buffer keeps it cheap even at 744×1024.
function applyFilmGrade(ctx) {
  const { width: w, height: h } = ctx.canvas;
  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;
  const sat = GRADE.saturation;
  const desat = 1 - sat;
  const grain = GRADE.grain;
  for (let i = 0; i < d.length; i += 4) {
    let r = (d[i] / 255) * GRADE.rGain;
    let g = (d[i + 1] / 255) * GRADE.gGain;
    let b = (d[i + 2] / 255) * GRADE.bGain;
    r = toneCurve(r);
    g = toneCurve(g);
    b = toneCurve(b);
    // Desaturate toward Rec.601 luma (keeps skin weighting natural).
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    r = lum * desat + r * sat;
    g = lum * desat + g * sat;
    b = lum * desat + b * sat;
    // Fine, shared (luminance) grain.
    const n = (Math.random() - 0.5) * grain;
    d[i] = clamp255(r + n);
    d[i + 1] = clamp255(g + n);
    d[i + 2] = clamp255(b + n);
  }
  ctx.putImageData(img, 0, 0);
}

// Soft highlight bloom (4). A downscaled bright-pass (mids/darks crushed, only
// highlights survive) is blurred and screen-blended back, so bright surfaces glow
// gently. Downscaling = the whole effect is a couple of cheap draws.
function applyBloom(ctx, canvas) {
  const w = canvas.width;
  const h = canvas.height;
  const bw = Math.max(1, Math.round(w / GRADE.bloomScale));
  const bh = Math.max(1, Math.round(h / GRADE.bloomScale));
  const bloom = document.createElement("canvas");
  bloom.width = bw;
  bloom.height = bh;
  const bctx = bloom.getContext("2d");
  // Bright pass: high contrast crushes everything but the highlights to ~black.
  bctx.filter = "brightness(1.1) contrast(1.8)";
  bctx.drawImage(canvas, 0, 0, bw, bh);
  // Screen blend (black = no change) the blurred highlights back over the photo.
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  ctx.globalAlpha = GRADE.bloomAlpha;
  ctx.filter = `blur(${GRADE.bloomBlur}px)`;
  ctx.drawImage(bloom, 0, 0, w, h);
  ctx.restore();
  ctx.filter = "none";
}

// Whisper-soft vignette (5): only the far corners dim; the centre is untouched.
function applyVignette(ctx) {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  const g = ctx.createRadialGradient(
    w / 2, h / 2, Math.min(w, h) * 0.42,
    w / 2, h / 2, Math.max(w, h) * 0.72
  );
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(1, `rgba(20,12,4,${GRADE.vignette})`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

// Cover-crop the centre of the video to the 744×1024 portrait frame, then bake the
// full Instax Mini 12 grade above. `mirror` flips horizontally for the front
// (selfie) camera so the preview/print read naturally; the back camera is NOT
// mirrored (text in the scene would otherwise come out reversed).
function captureFrame(video, mirror) {
  const canvas = document.createElement("canvas");
  canvas.width = PRINT_W;
  canvas.height = PRINT_H;
  const ctx = canvas.getContext("2d");

  const vw = video.videoWidth;
  const vh = video.videoHeight;
  // Cover-fit: crop the video to the target aspect, keeping the centre.
  let sw = vw, sh = vh, sx = 0, sy = 0;
  if (vw / vh > PRINT_AR) { sw = vh * PRINT_AR; sx = (vw - sw) / 2; }
  else { sh = vw / PRINT_AR; sy = (vh - sh) / 2; }

  // Draw (mirrored for the front camera), with a sub-pixel blur (6) so the print
  // isn't phone-sharp.
  ctx.save();
  ctx.filter = `blur(${GRADE.softness}px)`;
  if (mirror) {
    ctx.translate(PRINT_W, 0);
    ctx.scale(-1, 1);
  }
  ctx.drawImage(video, sx, sy, sw, sh, 0, 0, PRINT_W, PRINT_H);
  ctx.restore();
  ctx.filter = "none";

  applyFilmGrade(ctx); // 1, 2, 3, 7
  applyBloom(ctx, canvas); // 4 (after the grade, so it blooms the final tones)
  applyVignette(ctx); // 5 (last, over everything)

  return canvas;
}

const clampByte = (v) => (v < 0 ? 0 : v > 255 ? 255 : v);

// Paint a subtle instax paper texture over the whole frame: fine grain plus a
// faint woven-fibre weave, so the saved print reads as real photo paper instead
// of flat white. (The photo is drawn on top afterwards, covering the centre.)
function paintPaperTexture(ctx, w, h) {
  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;
  for (let y = 0; y < h; y++) {
    const wy = Math.sin(y * 1.15);
    for (let px = 0; px < w; px++) {
      const i = (y * w + px) * 4;
      const grain = (Math.random() - 0.5) * 9;        // fine paper grain
      const weave = (Math.sin(px * 1.15) + wy) * 1.9;  // soft woven fibres
      const delta = grain + weave;
      d[i] = clampByte(d[i] + delta);
      d[i + 1] = clampByte(d[i + 1] + delta);
      d[i + 2] = clampByte(d[i + 2] + delta);
    }
  }
  ctx.putImageData(img, 0, 0);
}

// Compose the portrait photo into a textured instax paper frame (thick bottom
// border, recessed photo window) — the thing the user saves.
export function composePolaroid(photo) {
  const c = document.createElement("canvas");
  c.width = CARD_W;
  c.height = CARD_H;
  const x = c.getContext("2d");

  // Warm off-white paper base with a gentle top->bottom shade.
  const g = x.createLinearGradient(0, 0, 0, CARD_H);
  g.addColorStop(0, "#f8f5ef");
  g.addColorStop(1, "#efe9dd");
  x.fillStyle = g;
  x.fillRect(0, 0, CARD_W, CARD_H);

  // Grain + weave over the paper.
  paintPaperTexture(x, CARD_W, CARD_H);

  // Recessed window: a soft shadow halo on the paper around the photo so it reads
  // as a print sunk slightly below the paper surface.
  x.save();
  x.shadowColor = "rgba(54, 44, 38, 0.33)";
  x.shadowBlur = 11;
  x.shadowOffsetY = 2;
  x.fillStyle = "#0b0b0b";
  x.fillRect(CARD_MARGIN, CARD_MARGIN, CARD_PHOTO_W, CARD_PHOTO_H);
  x.restore();

  // The photo itself.
  x.drawImage(photo, CARD_MARGIN, CARD_MARGIN, CARD_PHOTO_W, CARD_PHOTO_H);

  // Crisp hairline at the photo edge for definition.
  x.strokeStyle = "rgba(0, 0, 0, 0.12)";
  x.lineWidth = 1.5;
  x.strokeRect(CARD_MARGIN - 0.75, CARD_MARGIN - 0.75, CARD_PHOTO_W + 1.5, CARD_PHOTO_H + 1.5);

  return c;
}

// Download the framed polaroid as a PNG. Lives here (next to composePolaroid) so
// the viewing-mode Save button in ModelCanvas can reuse the exact same framing as
// the old in-overlay Save. `photo` is the graded square canvas from onCapture.
export function savePolaroid(photo) {
  if (!photo) return;
  composePolaroid(photo).toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "instax-photo.png";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, "image/png");
}

const CameraCapture = ({ onCapture, onUseDefault, onClose, onDone, initialStep = "choose" }) => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [step, setStep] = useState(initialStep); // choose | camera
  const [camStatus, setCamStatus] = useState("loading"); // loading | ready
  // Which camera to use: "user" (front/selfie) or "environment" (back). The flip
  // button only appears on devices that actually have more than one camera.
  const [facingMode, setFacingMode] = useState("user");
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
  };

  // Request the camera only while on the 'camera' step; release it when leaving.
  // Re-runs when facingMode changes (flip front<->back) to restart with the new camera.
  useEffect(() => {
    if (step !== "camera") return undefined;
    let cancelled = false;
    setCamStatus("loading");

    const start = async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        onUseDefault();
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          // `ideal` (not required) so devices without the requested camera still
          // work (a laptop with only a front cam just keeps it when "environment"
          // is asked). Portrait 744×1024 feed; captureFrame() cover-crops to that.
          video: {
            facingMode: { ideal: facingMode },
            width: { ideal: PRINT_W },
            height: { ideal: PRINT_H },
            aspectRatio: { ideal: PRINT_AR },
          },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        setCamStatus("ready");
        // Now that permission is granted, device labels/counts are reliable — show
        // the flip button only if there's genuinely more than one camera.
        try {
          const devices = await navigator.mediaDevices.enumerateDevices();
          if (!cancelled) {
            const cams = devices.filter((d) => d.kind === "videoinput");
            setHasMultipleCameras(cams.length > 1);
          }
        } catch {
          /* enumerateDevices unsupported — just leave the flip button hidden. */
        }
      } catch {
        if (!cancelled) onUseDefault();
      }
    };
    start();

    return () => {
      cancelled = true;
      stopStream();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, facingMode]);

  // Lock background scroll and allow Escape to dismiss for the overlay's lifetime.
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => {
      if (e.key === "Escape") {
        stopStream();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dismiss = () => {
    stopStream();
    onClose();
  };

  // Flip between front (selfie) and back camera. The effect restarts the stream.
  const flipCamera = () => setFacingMode((m) => (m === "user" ? "environment" : "user"));

  const handleShutter = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    // Only the front camera is mirrored (selfie); the back camera is left as-is.
    const photo = captureFrame(video, facingMode === "user");
    stopStream();
    // Commit immediately: stage the photo on the 3D model and close the overlay so
    // the eject + develop animation plays. The Save / Retake actions are shown on
    // the model afterwards (beneath the polaroid), not in a 2D popup here.
    onCapture(photo);
    if (onDone) onDone();
    else onClose();
  };

  // Portal to <body> so the fixed-position overlay covers the whole viewport.
  // Rendered in-place it would sit inside the ModelCanvas <section>, whose
  // transform/pin context makes position:fixed resolve against the section box
  // (leaving the navbar and other sections uncovered behind the popup).
  return createPortal(
    <div className="camera-capture" role="dialog" aria-modal="true" aria-label="Take a photo">
      <div className="camera-capture__backdrop" onClick={dismiss} />

      <div className="camera-capture__panel">
        <button type="button" className="camera-capture__close" onClick={dismiss} aria-label="Close">
          ✕
        </button>

        {step === "choose" && (
          <div className="camera-capture__choose">
            <h3 className="camera-capture__title">Print a photo</h3>
            <p className="camera-capture__hint">Take your own selfie, or print the default photo.</p>
            <div className="camera-capture__choices">
              <button
                type="button"
                className="camera-capture__btn camera-capture__btn--primary"
                onClick={() => setStep("camera")}
              >
                📷 Take a selfie
              </button>
              <button type="button" className="camera-capture__btn" onClick={onUseDefault}>
                Print default
              </button>
            </div>
          </div>
        )}

        {step === "camera" && (
          <>
            <div className="camera-capture__stage">
              <video
                ref={videoRef}
                className={`camera-capture__video${facingMode === "user" ? " camera-capture__video--mirror" : ""}`}
                autoPlay
                playsInline
                muted
              />
              <div className="camera-capture__frame" aria-hidden="true" />
              {hasMultipleCameras && (
                <button
                  type="button"
                  className="camera-capture__flip"
                  onClick={flipCamera}
                  disabled={camStatus !== "ready"}
                  aria-label={facingMode === "user" ? "Switch to back camera" : "Switch to front camera"}
                  title="Switch camera"
                >
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true">
                    <path d="M20 4h-3.17L15 2H9L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-5 11.5V13H9v2.5L5.5 12 9 8.5V11h6V8.5l3.5 3.5-3.5 3.5z" />
                  </svg>
                </button>
              )}
              {camStatus === "loading" && <div className="camera-capture__loading">Starting camera…</div>}
            </div>
            <p className="camera-capture__hint">
              {hasMultipleCameras
                ? "Line up your shot, flip the camera if you like, then tap the shutter"
                : "Line up your shot, then tap the shutter"}
            </p>
            <button
              type="button"
              className="camera-capture__shutter"
              onClick={handleShutter}
              disabled={camStatus !== "ready"}
              aria-label="Take photo"
            >
              <span className="camera-capture__shutter-ring" />
            </button>
          </>
        )}
      </div>
    </div>,
    document.body
  );
};

export default CameraCapture;
