import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

/*
  Webcam capture flow for the "press the shutter, print a polaroid" feature.
  Lives in the DOM (outside the R3F Canvas). Everything is client-side — the
  photo never leaves the browser.

  Three steps:
    choose  -> "Take a selfie" or "Print the default photo"
    camera  -> live preview + shutter
    result  -> the developed polaroid, draggable to rotate, with Save / Retake / Done

  Contract:
    onCapture(canvas) -> a square, selfie-mirrored, graded photo canvas; the caller
                         prints it on the 3D model. The overlay STAYS open to show
                         the result viewer; it closes via onClose.
    onUseDefault()    -> print the model's built-in default photo, then close.
    onClose()         -> dismiss the overlay (✕ / backdrop / Escape / Done).
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

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

// Cover-crop the centre of the video to the 744×1024 portrait frame, mirror it
// (selfie), bake a subtle instax colour grade (warm wash + vignette).
function captureFrame(video) {
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

  ctx.save();
  ctx.translate(PRINT_W, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(video, sx, sy, sw, sh, 0, 0, PRINT_W, PRINT_H);
  ctx.restore();

  ctx.fillStyle = "rgba(255, 224, 178, 0.10)";
  ctx.fillRect(0, 0, PRINT_W, PRINT_H);

  const g = ctx.createRadialGradient(
    PRINT_W / 2, PRINT_H / 2, PRINT_H * 0.3,
    PRINT_W / 2, PRINT_H / 2, PRINT_H * 0.72
  );
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(1, "rgba(25,12,0,0.34)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, PRINT_W, PRINT_H);

  return canvas;
}

// Compose the portrait photo into a white instax frame (thick bottom border) —
// the thing the user views in the overlay and saves.
function composePolaroid(photo) {
  const c = document.createElement("canvas");
  c.width = CARD_W;
  c.height = CARD_H;
  const x = c.getContext("2d");
  x.fillStyle = "#f7f4ee";
  x.fillRect(0, 0, CARD_W, CARD_H);
  x.drawImage(photo, CARD_MARGIN, CARD_MARGIN, CARD_PHOTO_W, CARD_PHOTO_H);
  x.strokeStyle = "rgba(0,0,0,0.08)";
  x.lineWidth = 2;
  x.strokeRect(CARD_MARGIN, CARD_MARGIN, CARD_PHOTO_W, CARD_PHOTO_H);
  return c;
}

const CameraCapture = ({ onCapture, onUseDefault, onClose, onDone }) => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const photoRef = useRef(null); // the captured square photo canvas (for Save / Retake)

  const [step, setStep] = useState("choose"); // choose | camera | result
  const [camStatus, setCamStatus] = useState("loading"); // loading | ready
  const [polaroidUrl, setPolaroidUrl] = useState(null);
  const [rot, setRot] = useState({ x: -10, y: 0 });
  const rotDragRef = useRef(null);

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
  };

  // Request the camera only while on the 'camera' step; release it when leaving.
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
          // `ideal` (not required) so devices without a front camera still work.
          // Request a portrait 744×1024 feed; the browser picks the closest mode
          // the webcam supports and captureFrame() cover-crops to exactly that.
          video: {
            facingMode: { ideal: "user" },
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
  }, [step]);

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

  const handleShutter = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const photo = captureFrame(video);
    photoRef.current = photo;
    setPolaroidUrl(composePolaroid(photo).toDataURL("image/png"));
    setRot({ x: -10, y: 0 });
    stopStream();
    setStep("result");
    onCapture(photo); // print on the 3D model (overlay stays open for the viewer)
  };

  const handleSave = () => {
    if (!photoRef.current) return;
    composePolaroid(photoRef.current).toBlob((blob) => {
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
  };

  // Result-card drag-to-rotate.
  const onCardDown = (e) => {
    rotDragRef.current = { x: e.clientX, y: e.clientY, rx: rot.x, ry: rot.y };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const onCardMove = (e) => {
    const d = rotDragRef.current;
    if (!d) return;
    setRot({
      x: clamp(d.rx - (e.clientY - d.y) * 0.4, -70, 70),
      y: d.ry + (e.clientX - d.x) * 0.4,
    });
  };
  const onCardUp = () => {
    rotDragRef.current = null;
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
              <video ref={videoRef} className="camera-capture__video" autoPlay playsInline muted />
              <div className="camera-capture__frame" aria-hidden="true" />
              {camStatus === "loading" && <div className="camera-capture__loading">Starting camera…</div>}
            </div>
            <p className="camera-capture__hint">Line up your shot, then tap the shutter</p>
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

        {step === "result" && (
          <>
            <div className="camera-capture__viewer">
              <div
                className="camera-capture__polaroid"
                style={{ transform: `rotateX(${rot.x}deg) rotateY(${rot.y}deg)` }}
                onPointerDown={onCardDown}
                onPointerMove={onCardMove}
                onPointerUp={onCardUp}
                onPointerCancel={onCardUp}
              >
                {polaroidUrl && <img src={polaroidUrl} alt="Your polaroid" draggable={false} />}
              </div>
            </div>
            <p className="camera-capture__hint">Drag to rotate your polaroid</p>
            <div className="camera-capture__actions">
              <button type="button" className="camera-capture__btn" onClick={() => setStep("camera")}>
                Retake
              </button>
              <button type="button" className="camera-capture__btn camera-capture__btn--primary" onClick={handleSave}>
                Save
              </button>
              <button
                type="button"
                className="camera-capture__btn camera-capture__btn--primary"
                onClick={() => {
                  // Commit: close the overlay and let the model eject + present the
                  // polaroid for viewing (handled by ModelCanvas / Instax12).
                  stopStream();
                  if (onDone) onDone();
                  else onClose();
                }}
              >
                Done
              </button>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  );
};

export default CameraCapture;
