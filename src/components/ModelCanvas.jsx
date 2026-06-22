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
import CameraCapture from "./CameraCapture.jsx";
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
                if (!material || material.name !== "pastel blue" || !material.color) return;

                if (!material.userData.originalColor) {
                    material.userData.originalColor = material.color.clone();
                }

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
        <group ref={ref} rotation={[0, 0, 0]} {...groupProps}>
            <Model
                hoveredPart={hoveredPart}
                setHoveredPart={setHoveredPart}
                onSelect={onSelect}
                isDraggingRef={isDraggingRef}
                onShutterPress={onShutterPress}
                photoImage={photoImage}
                photoNonce={photoNonce}
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
    const rotationTargetXRef = useRef(0);
    const rotationTargetYRef = useRef(0);
    const invalidateRef = useRef(() => { });
    const [modelColor, setModelColor] = useState(INSTAX_COLORS[0].value);
    const [isDragging, setIsDragging] = useState(false);
    const modelSize = [0.45, 0.45, 0.45];
    const [hoveredPart, setHoveredPart] = useState(null);
    const activePart = hoveredPart;
    // Webcam selfie -> polaroid print flow.
    const [captureOpen, setCaptureOpen] = useState(false);
    const [polaroidPhoto, setPolaroidPhoto] = useState(null);
    const [photoNonce, setPhotoNonce] = useState(0);

    const handleShutterPress = () => {
        // The overlay opens on top and steals the pointer, so the model-3d's
        // pointerup never fires — clear the drag state so the model doesn't keep
        // following the mouse afterwards (fixes the "moves without holding" bug).
        isPointerDownRef.current = false;
        isDraggingRef.current = false;
        setIsDragging(false);
        setCaptureOpen(true);
    };
    const handleCapture = (canvas) => {
        // Print on the 3D model (eject + develop). Keep the overlay OPEN so it can
        // show the result viewer (view / rotate / save); it closes via onClose.
        setPolaroidPhoto(canvas);
        setPhotoNonce((n) => n + 1);
    };
    const handleUseDefault = () => {
        setPolaroidPhoto(null); // null -> model prints its built-in default photo
        setCaptureOpen(false);
        setPhotoNonce((n) => n + 1);
    };
    const handleCloseCapture = () => setCaptureOpen(false); // dismiss the overlay
    // Treat tablets as touch (tap-to-select the model parts). The width clause
    // covers tablets that report a fine pointer / DevTools emulation where
    // (hover:none)/(pointer:coarse) don't fire — matches the ≤1399 tablet range.
    const isTouch = useMediaQuery({ query: '(hover: none), (pointer: coarse), (max-width: 1399px)' });

    useEffect(() => {
        hoveredPartRef.current = hoveredPart;
    }, [hoveredPart]);

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
            if (!isPointerInsideRef.current || !hoveredPartRef.current) return;
            event.preventDefault();
            event.stopPropagation();
            rotationTargetYRef.current += event.deltaY * 0.003;
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
                    {!activePart && (
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
                    if (!hoveredPartRef.current) return;
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
                    rotationTargetYRef.current += deltaX * 0.01;
                    rotationTargetXRef.current += deltaY * 0.01;
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
                        <Environment background={false} preset="warehouse" intensity={2} resolution={64} />
                        <directionalLight position={[2, 2, 2]} intensity={1} />
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
                        />
                    </Suspense>
                </Canvas>
            </div>
            <p className="model-canvas-instruction reveal">
                {isTouch ? "Drag the camera to rotate" : "Drag or scroll to rotate camera"}
            </p>
            {captureOpen && (
                <CameraCapture
                    onCapture={handleCapture}
                    onUseDefault={handleUseDefault}
                    onClose={handleCloseCapture}
                />
            )}
        </section>
    );
};

useGLTF.preload('/models/bg_dropoff-compressed.glb');

export default ModelCanvas;
