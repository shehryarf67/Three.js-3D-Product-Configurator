import {
    Canvas,
    useRef,
    useFrame,
    useThree,
    useState,
    useEffect,
    useGLTF,
    Environment,
    ContactShadows,
    Html,
    useProgress,
    Suspense,
    useMediaQuery,
} from "../imports.js";
import { Model as Model } from "./Instax12.jsx";
import CameraCapture, { savePolaroid } from "./CameraCapture.jsx";
// New hi-res balls (balls_hd 6-10 are the "lower sections" set): 6=purple 8=pink.
import ballPink from "../assets/balls_hd/8.webp";
import ballPurple from "../assets/balls_hd/6.webp";

const INSTAX_COLORS = [
    { name: "Lilac Purple", value: "#C8A2C8" },
    { name: "Clay White", value: "#E2E1D3" },
    { name: "Mint Green", value: "#84E8BD" },
    { name: "Blossom Pink", value: "#F0AABA" },
    { name: "Baby Blue", value: "#89CFF0" },
];

// Mockup shows two balls in this section: a large purple on the left and a
// pink bleeding off the bottom-right. (The blue/mint/white were removed.)
const MODEL_BALLS = [
    { src: ballPurple, className: "model-ball model-ball--purple" },
    { src: ballPink, className: "model-ball model-ball--pink" },
];

const getDragStartThreshold = (pointerType) => (pointerType === "touch" ? 12 : 4);

// Slight resting tilt (radians) for the model's initial pose so it reads as a 3D
// object — a gentle 3/4 turn (yaw) with a touch of downward pitch — instead of a
// flat, front-on product shot. The user can still drag it anywhere from here.
const MODEL_REST_TILT = { x: 0.08, y: -0.35 };

// The body's raised decals (logo, lens-ring text) live in the normal map. The GLB
// authors normalScale = 1; under this scene's soft IBL the relief barely reads, so
// we emphasise it a touch. Tune here if the decals are too strong/weak.
const DECAL_NORMAL_SCALE = 1.5;

function Backdrop() {
    const { scene } = useGLTF('/models/bg_dropoff-compressed.glb')
    return (
        <primitive
            object={scene}
            position={[0, -0.85, -1]}
            scale={[2, 2, 2]}
        />
    )
}

function ModelLoader() {
    const { progress } = useProgress();

    return (
        <Html center>
            <div className="model-loader">
                <div className="model-loader__ring" />
                <p className="model-loader__label">Loading camera...</p>
                <span className="model-loader__progress">{Math.round(progress)}%</span>
            </div>
        </Html>
    );
}

function ScrollingModel({
    rotationTargetXRef,
    rotationTargetYRef,
    modelColor,
    hoveredPart,
    setHoveredPart,
    onSelect,
    isDraggingRef,
    invalidateRef,
    onShutterPress,
    photoImage,
    photoNonce,
    polaroidPhase,
    polaroidRotXRef,
    polaroidRotYRef,
    onEjectDone,
    onReturnDone,
    onPolaroidClose,
    onDefaultImage,
    ...groupProps
}) {
    const ref = useRef();
    const { invalidate } = useThree();
    useEffect(() => {
        invalidateRef.current = invalidate;
    }, [invalidate]);

    useEffect(() => {
        if (!ref.current) return;

        ref.current.traverse((child) => {
            if (!child.isMesh || !child.material) return;

            const materials = Array.isArray(child.material) ? child.material : [child.material];

            materials.forEach((material) => {
                if (!material || material.name !== "BASE_TEXTURE" || !material.color) return;

                if (!material.userData.originalColor) {
                    material.userData.originalColor = material.color.clone();
                }

                // Emphasise the normal-map relief (the raised decals) — see DECAL_NORMAL_SCALE.
                if (material.normalMap) material.normalScale.set(DECAL_NORMAL_SCALE, DECAL_NORMAL_SCALE);

                if (modelColor) {
                    material.color.set(modelColor);
                } else {
                    material.color.copy(material.userData.originalColor);
                }
            });
        });

        invalidate();
    }, [modelColor]);

    useFrame((_, delta) => {
        if (!ref.current) return;
        const dx = rotationTargetXRef.current - ref.current.rotation.x;
        const dy = rotationTargetYRef.current - ref.current.rotation.y;
        if (Math.abs(dx) < 0.0001 && Math.abs(dy) < 0.0001) return;
        const smoothing = Math.min(1, delta * 8);
        ref.current.rotation.x += dx * smoothing;
        ref.current.rotation.y += dy * smoothing;
        invalidate();
    });

    return (
        <group ref={ref} rotation={[MODEL_REST_TILT.x, MODEL_REST_TILT.y, 0]} {...groupProps}>
            <Model
                hoveredPart={hoveredPart}
                setHoveredPart={setHoveredPart}
                onSelect={onSelect}
                isDraggingRef={isDraggingRef}
                onShutterPress={onShutterPress}
                photoImage={photoImage}
                photoNonce={photoNonce}
                polaroidPhase={polaroidPhase}
                polaroidRotXRef={polaroidRotXRef}
                polaroidRotYRef={polaroidRotYRef}
                onEjectDone={onEjectDone}
                onReturnDone={onReturnDone}
                onPolaroidClose={onPolaroidClose}
                onDefaultImage={onDefaultImage}
                rotation={[0, 0, 0]}
            />
        </group>
    );
}


const ModelCanvas = () => {
    const model3dRef = useRef(null);
    const isPointerInsideRef = useRef(false);
    const isPointerDownRef = useRef(false);
    const isDraggingRef = useRef(false);
    const hoveredPartRef = useRef(null);
    const lastPointerXRef = useRef(0);
    const lastPointerYRef = useRef(0);
    // Start at the resting tilt so the model loads as a 3D 3/4 view (the group's
    // initial rotation matches, so there's no intro snap). resetCameraRotation()
    // still squares it to front before a polaroid eject so the print presents
    // upright; the tilt is purely the idle presentation pose.
    const rotationTargetXRef = useRef(MODEL_REST_TILT.x);
    const rotationTargetYRef = useRef(MODEL_REST_TILT.y);
    // Drag targets for the polaroid while it's being viewed on its own ('viewing').
    const polaroidRotXRef = useRef(0);
    const polaroidRotYRef = useRef(0);
    const polaroidPhaseRef = useRef("idle");
    const invalidateRef = useRef(() => { });
    const [modelColor, setModelColor] = useState(INSTAX_COLORS[0].value);
    const [isDragging, setIsDragging] = useState(false);
    const modelSize = [0.45, 0.45, 0.45];
    const [hoveredPart, setHoveredPart] = useState(null);
    const activePart = hoveredPart;
    // Webcam selfie -> polaroid print flow.
    const [captureOpen, setCaptureOpen] = useState(false);
    // Which step the capture overlay opens on: "choose" normally, "camera" when
    // the user hits Retake from the viewing mode (jump straight back to the lens).
    const [captureStart, setCaptureStart] = useState("choose");
    const [polaroidPhoto, setPolaroidPhoto] = useState(null);
    // The built-in default photo's source image (reported by Instax12 when the
    // default is printed), so the viewing-mode Save works for it too.
    const defaultPhotoImageRef = useRef(null);
    const [photoNonce, setPhotoNonce] = useState(0);
    // Polaroid present/view phase: idle | ejecting | viewing | returning.
    // (See Instax12.jsx Model — it turns each phase into the right animation.)
    const [polaroidPhase, setPolaroidPhase] = useState("idle");

    const handleShutterPress = () => {
        // Ignore the shutter unless we're idle — no re-triggering mid eject/view.
        if (polaroidPhaseRef.current !== "idle") return;
        // The overlay opens on top and steals the pointer, so the model-3d's
        // pointerup never fires — clear the drag state so the model doesn't keep
        // following the mouse afterwards (fixes the "moves without holding" bug).
        isPointerDownRef.current = false;
        isDraggingRef.current = false;
        setIsDragging(false);
        setCaptureStart("choose");
        setCaptureOpen(true);
    };
    const handleCapture = (canvas) => {
        // Stage the captured photo onto the polaroid's photo plane (POLAROID_1).
        // The overlay then closes (onDone) and the eject + develop animation plays;
        // the Save / Retake actions appear beneath the polaroid in viewing mode.
        setPolaroidPhoto(canvas);
        setPhotoNonce((n) => n + 1);
    };
    // Bring the camera back to a front-facing rest pose so the polaroid presents
    // upright once the camera is hidden.
    const resetCameraRotation = () => {
        rotationTargetXRef.current = 0;
        rotationTargetYRef.current = 0;
    };
    // "Done" after a selfie: close the overlay and start the eject -> view sequence.
    const handleDone = () => {
        resetCameraRotation();
        setCaptureOpen(false);
        setPolaroidPhase("ejecting");
    };
    const handleUseDefault = () => {
        resetCameraRotation();
        setPolaroidPhoto(null); // null -> model prints its built-in default photo
        setCaptureOpen(false);
        setPhotoNonce((n) => n + 1);
        setPolaroidPhase("ejecting");
    };
    const handleCloseCapture = () => setCaptureOpen(false); // dismiss without ejecting
    // Phase advances driven by the model's animation 'finished' events.
    const handleEjectDone = () => setPolaroidPhase("viewing");
    const handleReturnDone = () => setPolaroidPhase("idle");
    // Cross button while viewing: retract the polaroid, bring the camera back.
    const handlePolaroidClose = () => {
        isPointerDownRef.current = false;
        isDraggingRef.current = false;
        setIsDragging(false);
        setPolaroidPhase("returning");
    };
    // Viewing-mode actions (rendered beneath the polaroid).
    // Save: download the framed print — the captured selfie if there is one, else
    // the built-in default photo's image (reported by Instax12 via onDefaultImage).
    const handleSavePolaroid = () => savePolaroid(polaroidPhoto || defaultPhotoImageRef.current);
    // Retake: drop straight back to idle (hides the polaroid, camera returns with
    // no animation needed since the overlay covers it) and reopen the camera step.
    const handleRetake = () => {
        isPointerDownRef.current = false;
        isDraggingRef.current = false;
        setIsDragging(false);
        setPolaroidPhase("idle");
        setCaptureStart("camera");
        setCaptureOpen(true);
    };
    // Treat tablets as touch (tap-to-select the model parts). The width clause
    // covers tablets that report a fine pointer / DevTools emulation where
    // (hover:none)/(pointer:coarse) don't fire — matches the ≤1399 tablet range.
    // Touch vs mouse by INPUT capability, not width: a landscape tablet at
    // 1024–1200px (touch) gets tap-to-select, while a same-width laptop (mouse)
    // keeps hover. (Was width-gated at ≤1399, which forced tap on 1024–1399 mice.)
    const isTouch = useMediaQuery({ query: '(hover: none), (pointer: coarse)' });

    useEffect(() => {
        hoveredPartRef.current = hoveredPart;
    }, [hoveredPart]);

    useEffect(() => {
        polaroidPhaseRef.current = polaroidPhase;
    }, [polaroidPhase]);

    // The capture overlay covers the canvas and steals the pointer, so the
    // model-3d's pointerup never fires after the shutter click. Clear the drag
    // state once the overlay is open (runs after render, so it wins the race with
    // the pointerdown that set it) — otherwise the model keeps rotating with the
    // mouse afterwards without holding.
    useEffect(() => {
        // Opening/closing the overlay: clear any drag state so the model doesn't
        // keep following the mouse. On close, also clear the hovered part — the
        // shutter press set it to 'polaroid-image' (for the spec text + develop),
        // and leaving it set keeps the canvas stuck on the "grab" cursor even
        // though the pointer is just resting over it.
        isPointerDownRef.current = false;
        isDraggingRef.current = false;
        setIsDragging(false);
        if (!captureOpen) setHoveredPart(null);
    }, [captureOpen]);

    useEffect(() => {
        const node = model3dRef.current;
        if (!node) return;

        const handleWheel = (event) => {
            if (!isPointerInsideRef.current) return;
            const viewing = polaroidPhaseRef.current === "viewing";
            // Only rotate when the pointer is actually over an interactive mesh: a
            // camera part normally, or the polaroid itself while viewing. Otherwise
            // let the page scroll (and don't spin the polaroid from empty canvas).
            if (viewing ? hoveredPartRef.current !== "polaroid-image" : !hoveredPartRef.current) return;
            event.preventDefault();
            event.stopPropagation();
            if (viewing) {
                // Spin the lone polaroid in place, not the (hidden) camera group.
                polaroidRotYRef.current += event.deltaY * 0.003;
            } else {
                rotationTargetYRef.current += event.deltaY * 0.003;
            }
            invalidateRef.current();
        };

        node.addEventListener("wheel", handleWheel, { passive: false });
        return () => node.removeEventListener("wheel", handleWheel);
    }, []);

    return (
        <section className="model-canvas" id="model-canvas">
            {MODEL_BALLS.map((ball) => (
                <img key={ball.className} className={ball.className} src={ball.src} alt="" aria-hidden="true" />
            ))}
            <div className="model-canvas-bg reveal-scale" />
            <div className="model-canvas-content reveal">
                <div className="specs-anchor">
                    {!activePart && polaroidPhase !== "viewing" && (
                        <div className="default-specs">
                            <p className="default-specs-text">
                                {isTouch
                                    ? "Tap any part of the camera to explore its specs"
                                    : "Hover over any part of the camera to explore its specs"}
                            </p>
                        </div>
                    )}
                    {activePart === "body" && (
                        <div className="body-specs">
                            <p className="body-specs-label">Body Specs</p>
                            <h2 className="body-specs-title">Rangefinder Camera Body</h2>
                            <p className="body-specs-text">
                                The main shell houses the camera internals and defines the classic rangefinder silhouette,
                                balancing portability with a sturdy metal-and-leather inspired profile.
                            </p>
                        </div>
                    )}
                    {activePart === "lens" && (
                        <div className="lens-specs">
                            <p className="lens-specs-label">Lens Specs</p>
                            <h2 className="lens-specs-title">Digital Rangefinder Lens</h2>
                            <p className="lens-specs-text">
                                Multi-element front optic with a compact barrel profile, styled for a classic
                                rangefinder look and highlighted independently from the body.
                            </p>
                        </div>
                    )}
                    {activePart === "sockel" && (
                        <div className="sockel-specs">
                            <p className="sockel-specs-label">Sockel Specs</p>
                            <h2 className="sockel-specs-title">Camera Sockel</h2>
                            <p className="sockel-specs-text">
                                The camera's base, designed to provide stability and support for the entire structure, ensuring a secure grip and balance.
                            </p>
                        </div>
                    )}
                    {activePart === "battery-cover" && (
                        <div className="battery-cover-specs">
                            <p className="battery-cover-specs-label">Battery Cover</p>
                            <h2 className="battery-cover-specs-title">Sliding Battery Door</h2>
                            <p className="battery-cover-specs-text">
                                Rear-access cover for the camera's power compartment, separated from the shell so it
                                can slide out on hover and show the removable panel detail.
                            </p>
                        </div>
                    )}
                    {activePart === "flashlight" && (
                        <div className="flashlight-specs">
                            <p className="flashlight-specs-label">Flashlight Specs</p>
                            <h2 className="flashlight-specs-title">Auto Flash Window</h2>
                            <p className="flashlight-specs-text">
                                Compact front flash with a subtle pulse animation, calling attention to the automatic
                                exposure support built into the camera face.
                            </p>
                        </div>
                    )}
                    {activePart === "shutter-button" && (
                        <div className="shutter-button-specs">
                            <p className="shutter-button-specs-label">Shutter Button</p>
                            <h2 className="shutter-button-specs-title">Press To Print</h2>
                            <p className="shutter-button-specs-text">
                                The raised top button triggers the instant-photo animation, giving the model a tactile
                                camera moment instead of staying as a static product view.
                            </p>
                        </div>
                    )}
                    {activePart === "polaroid-image" && (
                        <div className="polaroid-image-specs">
                            <p className="polaroid-image-specs-label">Instant Print</p>
                            <h2 className="polaroid-image-specs-title">Polaroid-Style Photo</h2>
                            <p className="polaroid-image-specs-text">
                                A small print plane slides out from the camera body after the shutter press, echoing
                                the instant film reveal that defines the Instax experience.
                            </p>
                        </div>
                    )}
                </div>
            </div>
            <div className="model-color-picker reveal">
                <div className="color-palette">
                    {INSTAX_COLORS.map((color) => (
                        <button
                            key={color.name}
                            className={`swatch ${modelColor === color.value ? "active" : ""}`}
                            style={{ background: color.value }}
                            title={color.name}
                            onClick={() => setModelColor(color.value)}
                        />
                    ))}
                </div>
                <span>COLOR PICK</span>
            </div>
            <div
                className="model-3d reveal"
                style={{ cursor: isDragging ? "grabbing" : hoveredPart ? "grab" : "default" }}
                ref={model3dRef}
                onPointerEnter={() => {
                    isPointerInsideRef.current = true;
                }}
                onPointerLeave={() => {
                    isPointerInsideRef.current = false;
                }}
                onPointerDown={(event) => {
                    // Only start a drag when the pointer is actually over an interactive
                    // mesh: a camera part in normal mode, or the polaroid itself while
                    // viewing. (Previously 'viewing' let you grab/rotate from anywhere on
                    // the canvas, including the empty space around the polaroid.)
                    if (polaroidPhaseRef.current === "viewing"
                        ? hoveredPartRef.current !== "polaroid-image"
                        : !hoveredPartRef.current) return;
                    isPointerDownRef.current = true;
                    lastPointerXRef.current = event.clientX;
                    lastPointerYRef.current = event.clientY;
                }}
                onPointerMove={(event) => {
                    if (!isPointerDownRef.current) return;

                    const deltaX = event.clientX - lastPointerXRef.current;
                    const deltaY = event.clientY - lastPointerYRef.current;

                    if (!isDraggingRef.current) {
                        const dragStartThreshold = getDragStartThreshold(event.pointerType);

                        if (Math.abs(deltaX) > dragStartThreshold || Math.abs(deltaY) > dragStartThreshold) {
                            isDraggingRef.current = true;
                            setIsDragging(true);
                            event.currentTarget.setPointerCapture(event.pointerId);
                            lastPointerXRef.current = event.clientX;
                            lastPointerYRef.current = event.clientY;
                        }
                        return;
                    }

                    lastPointerXRef.current = event.clientX;
                    lastPointerYRef.current = event.clientY;
                    if (polaroidPhaseRef.current === "viewing") {
                        // Spin the lone polaroid instead of the (hidden) camera.
                        polaroidRotYRef.current += deltaX * 0.01;
                        polaroidRotXRef.current += deltaY * 0.01;
                    } else {
                        rotationTargetYRef.current += deltaX * 0.01;
                        rotationTargetXRef.current += deltaY * 0.01;
                    }
                    invalidateRef.current();
                }}
                onPointerUp={(event) => {
                    isPointerDownRef.current = false;
                    isDraggingRef.current = false;
                    setIsDragging(false);

                    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                        event.currentTarget.releasePointerCapture(event.pointerId);
                    }
                }}
                onPointerCancel={(event) => {
                    isPointerDownRef.current = false;
                    isDraggingRef.current = false;
                    setIsDragging(false);

                    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                        event.currentTarget.releasePointerCapture(event.pointerId);
                    }
                }}
            >
                <Canvas
                    frameloop="demand"
                    dpr={[1, 1.5]}
                    camera={{ position: [0, 0.9, 6.55], fov: 38, near: 0.1, far: 100 }}
                    gl={{
                        alpha: true,
                        antialias: false,
                        powerPreference: "low-power",
                    }}
                    onPointerMissed={() => {
                        if (isTouch) setHoveredPart(null);
                    }}
                >
                    <Suspense fallback={<ModelLoader />}>
                        {/* resolution bumped 64 -> 256: a sharper IBL gives the body
                            surface defined specular gradients, which is what makes the
                            normal-map decals read (a 64px env is too blurry/flat). */}
                        <Environment background={false} preset="warehouse" intensity={2} resolution={256} />
                        {/* A bit more directional punch (1 -> 1.5) so the raised decals
                            catch a shading gradient and don't wash out under the soft IBL. */}
                        <directionalLight position={[2, 2, 2]} intensity={1.5} />
                        {/* <Backdrop /> */}
                        <ScrollingModel
                            scale={modelSize}
                            position={[0, -0.06, 0]}
                            rotationTargetXRef={rotationTargetXRef}
                            rotationTargetYRef={rotationTargetYRef}
                            modelColor={modelColor}
                            hoveredPart={hoveredPart}
                            setHoveredPart={setHoveredPart}
                            isDraggingRef={isDraggingRef}
                            onSelect={() => { }}
                            invalidateRef={invalidateRef}
                            onShutterPress={handleShutterPress}
                            photoImage={polaroidPhoto}
                            photoNonce={photoNonce}
                            polaroidPhase={polaroidPhase}
                            polaroidRotXRef={polaroidRotXRef}
                            polaroidRotYRef={polaroidRotYRef}
                            onEjectDone={handleEjectDone}
                            onReturnDone={handleReturnDone}
                            onPolaroidClose={handlePolaroidClose}
                            onDefaultImage={(img) => { defaultPhotoImageRef.current = img; }}
                        />
                    </Suspense>
                </Canvas>
                {/* Viewing-mode actions, shown BENEATH the polaroid once the eject +
                    develop animation has finished (the cross button in the 3D scene
                    is the "done/close"). Positioned over the canvas via CSS so it
                    stays put while the polaroid is dragged to rotate. stopPropagation
                    keeps a button press from starting a model/polaroid drag. */}
                {polaroidPhase === "viewing" && (
                    <div
                        className="polaroid-view-actions"
                        onPointerDown={(e) => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            className="polaroid-view-btn"
                            onClick={handleRetake}
                        >
                            Retake
                        </button>
                        <button
                            type="button"
                            className="polaroid-view-btn polaroid-view-btn--primary"
                            onClick={handleSavePolaroid}
                        >
                            Save
                        </button>
                    </div>
                )}
            </div>
            <p className="model-canvas-instruction reveal">
                {polaroidPhase === "viewing"
                    ? "Drag or scroll to rotate your polaroid"
                    : isTouch
                    ? "Drag the camera to rotate"
                    : "Drag or scroll to rotate camera"}
            </p>
            {captureOpen && (
                <CameraCapture
                    initialStep={captureStart}
                    onCapture={handleCapture}
                    onUseDefault={handleUseDefault}
                    onClose={handleCloseCapture}
                    onDone={handleDone}
                />
            )}
        </section>
    );
};

useGLTF.preload('/models/bg_dropoff-compressed.glb');

export default ModelCanvas;
