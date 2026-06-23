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

const PRINT_SIZE = 1024; // square source-photo resolution
// Polaroid frame layout — matches drawDevelop() in Instax12.jsx so the saved /
// previewed polaroid looks identical to the one printed on the 3D model.
const CARD_W = 600;
const CARD_H = 747;
const PHOTO_MARGIN = 0.1; // side/top margin as a fraction of card width
const PHOTO_TOP = 0.07;   // top margin as a fraction of card height

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

// Square-crop the centre of the video, mirror it (selfie), bake a subtle instax
// colour grade (warm wash + vignette).
function captureFrame(video) {
  const canvas = document.createElement("canvas");
  canvas.width = PRINT_SIZE;
  canvas.height = PRINT_SIZE;
  const ctx = canvas.getContext("2d");

  const vw = video.videoWidth;
  const vh = video.videoHeight;
  const side = Math.min(vw, vh);
  const sx = (vw - side) / 2;
  const sy = (vh - side) / 2;

  ctx.save();
  ctx.translate(PRINT_SIZE, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(video, sx, sy, side, side, 0, 0, PRINT_SIZE, PRINT_SIZE);
  ctx.restore();

  ctx.fillStyle = "rgba(255, 224, 178, 0.10)";
  ctx.fillRect(0, 0, PRINT_SIZE, PRINT_SIZE);

  const g = ctx.createRadialGradient(
    PRINT_SIZE / 2, PRINT_SIZE / 2, PRINT_SIZE * 0.3,
    PRINT_SIZE / 2, PRINT_SIZE / 2, PRINT_SIZE * 0.72
  );
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(1, "rgba(25,12,0,0.34)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, PRINT_SIZE, PRINT_SIZE);

  return canvas;
}

// Compose the square photo into a white instax frame (thick bottom border) — the
// thing the user views and saves.
function composePolaroid(photo) {
  const c = document.createElement("canvas");
  c.width = CARD_W;
  c.height = CARD_H;
  const x = c.getContext("2d");
  x.fillStyle = "#f7f4ee";
  x.fillRect(0, 0, CARD_W, CARD_H);
  const m = Math.round(CARD_W * PHOTO_MARGIN);
  const top = Math.round(CARD_H * PHOTO_TOP);
  const sq = CARD_W - 2 * m;
  x.drawImage(photo, m, top, sq, sq);
  x.strokeStyle = "rgba(0,0,0,0.08)";
  x.lineWidth = 2;
  x.strokeRect(m, top, sq, sq);
  return c;
}

const CameraCapture = ({ onCapture, onUseDefault, onClose }) => {
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
          video: { facingMode: { ideal: "user" }, width: { ideal: 1280 }, height: { ideal: 720 } },
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
              <button type="button" className="camera-capture__btn" onClick={dismiss}>
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
