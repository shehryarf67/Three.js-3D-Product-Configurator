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
} from "../imports.js";
import { Model as Model } from "./Instax12.jsx";

const INSTAX_COLORS = [
    { name: "Lilac Purple", value: "#C8A2C8" },
    { name: "Clay White", value: "#E2E1D3" },
    { name: "Mint Green", value: "#98FF98" },
    { name: "Blossom Pink", value: "#F0AABA" },
    { name: "Baby Blue", value: "#89CFF0" },
];

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
    rotationTargetX,
    rotationTargetY,
    modelColor,
    hoveredPart,
    setHoveredPart,
    onSelect,
    invalidateRef,
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
        const dx = rotationTargetX.current - ref.current.rotation.x;
        const dy = rotationTargetY.current - ref.current.rotation.y;
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
                modelColor={modelColor}
                rotation={[0, 0, 0]}
            />
        </group>
    );
}


const ModelCanvas = () => {
    const model3dRef = useRef(null);
    const isPointerInside = useRef(false);
    const isPointerDown = useRef(false);
    const isDragging = useRef(false);
    const lastPointerX = useRef(0);
    const lastPointerY = useRef(0);
    const rotationTargetX = useRef(0);
    const rotationTargetY = useRef(0);
    const invalidateRef = useRef(() => { });
    const [modelColor, setModelColor] = useState(INSTAX_COLORS[0].value);
    const modelSize = [0.48, 0.48, 0.48];
    const [hoveredPart, setHoveredPart] = useState(null);

    useEffect(() => {
        const node = model3dRef.current;
        if (!node) return;

        const handleWheel = (event) => {
            if (!isPointerInside.current) return;
            event.preventDefault();
            event.stopPropagation();
            rotationTargetY.current += event.deltaY * 0.003;
            invalidateRef.current();
        };

        node.addEventListener("wheel", handleWheel, { passive: false });
        return () => node.removeEventListener("wheel", handleWheel);
    }, []);

    return (
        <section className="model-canvas" id="model-canvas">
            <div className="model-canvas-bg reveal-scale" />
            <div className="model-canvas-content reveal">
                <h1 className="model-canvas-title">Capture The Moment</h1>
                <p className="model-canvas-description">Drag or scroll on the model panel to rotate the camera.</p>
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
                <div className="specs-anchor">
                    {hoveredPart === "body" && (
                        <div className="body-specs">
                            <p className="body-specs-label">Body Specs</p>
                            <h2 className="body-specs-title">Rangefinder Camera Body</h2>
                            <p className="body-specs-text">
                                The main shell houses the camera internals and defines the classic rangefinder silhouette,
                                balancing portability with a sturdy metal-and-leather inspired profile.
                            </p>
                        </div>
                    )}
                    {hoveredPart === "lens" && (
                        <div className="lens-specs">
                            <p className="lens-specs-label">Lens Specs</p>
                            <h2 className="lens-specs-title">Digital Rangefinder Lens</h2>
                            <p className="lens-specs-text">
                                Multi-element front optic with a compact barrel profile, styled for a classic
                                rangefinder look and highlighted independently from the body.
                            </p>
                        </div>
                    )}
                    {hoveredPart === "sockel" && (
                        <div className="sockel-specs">
                            <p className="sockel-specs-label">Sockel Specs</p>
                            <h2 className="sockel-specs-title">Camera Sockel</h2>
                            <p className="sockel-specs-text">
                                The camera's base, designed to provide stability and support for the entire structure, ensuring a secure grip and balance.
                            </p>
                        </div>
                    )}
                    {hoveredPart === "battery-cover" && (
                        <div className="battery-cover-specs">
                            <p className="battery-cover-specs-label">Battery Cover</p>
                            <h2 className="battery-cover-specs-title">Sliding Battery Door</h2>
                            <p className="battery-cover-specs-text">
                                Rear-access cover for the camera's power compartment, separated from the shell so it
                                can slide out on hover and show the removable panel detail.
                            </p>
                        </div>
                    )}
                    {hoveredPart === "flashlight" && (
                        <div className="flashlight-specs">
                            <p className="flashlight-specs-label">Flashlight Specs</p>
                            <h2 className="flashlight-specs-title">Auto Flash Window</h2>
                            <p className="flashlight-specs-text">
                                Compact front flash with a subtle pulse animation, calling attention to the automatic
                                exposure support built into the camera face.
                            </p>
                        </div>
                    )}
                    {hoveredPart === "shutter-button" && (
                        <div className="shutter-button-specs">
                            <p className="shutter-button-specs-label">Shutter Button</p>
                            <h2 className="shutter-button-specs-title">Press To Print</h2>
                            <p className="shutter-button-specs-text">
                                The raised top button triggers the instant-photo animation, giving the model a tactile
                                camera moment instead of staying as a static product view.
                            </p>
                        </div>
                    )}
                    {hoveredPart === "polaroid-image" && (
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
            <div
                className="model-3d reveal"
                ref={model3dRef}
                onPointerEnter={() => {
                    isPointerInside.current = true;
                }}
                onPointerLeave={() => {
                    isPointerInside.current = false;
                }}
                onPointerDown={(event) => {
                    isPointerDown.current = true;
                    lastPointerX.current = event.clientX;
                    lastPointerY.current = event.clientY;
                }}
                onPointerMove={(event) => {
                    if (!isPointerDown.current) return;

                    const deltaX = event.clientX - lastPointerX.current;
                    const deltaY = event.clientY - lastPointerY.current;

                    if (!isDragging.current) {
                        if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) {
                            isDragging.current = true;
                            event.currentTarget.setPointerCapture(event.pointerId);
                            lastPointerX.current = event.clientX;
                            lastPointerY.current = event.clientY;
                        }
                        return;
                    }

                    lastPointerX.current = event.clientX;
                    lastPointerY.current = event.clientY;
                    rotationTargetY.current += deltaX * 0.01;
                    rotationTargetX.current += deltaY * 0.01;
                    invalidateRef.current();
                }}
                onPointerUp={(event) => {
                    isPointerDown.current = false;
                    isDragging.current = false;

                    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                        event.currentTarget.releasePointerCapture(event.pointerId);
                    }
                }}
                onPointerCancel={(event) => {
                    isPointerDown.current = false;
                    isDragging.current = false;

                    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                        event.currentTarget.releasePointerCapture(event.pointerId);
                    }
                }}
            >
                <Canvas
                    frameloop="demand"
                    camera={{ position: [0, 0.5, 5.8], fov: 38, near: 0.1, far: 100 }}
                    gl={{ alpha: true }}
                >
                    <Suspense fallback={<ModelLoader />}>
                        <Environment background={false} preset="warehouse" intensity={2} />
                        <directionalLight position={[2, 2, 2]} intensity={1} />
                        {/* <Backdrop /> */}
                        <ScrollingModel
                            scale={modelSize}
                            position={[0, 0.25, 0]}
                            rotationTargetX={rotationTargetX}
                            rotationTargetY={rotationTargetY}
                            modelColor={modelColor}
                            hoveredPart={hoveredPart}
                            setHoveredPart={setHoveredPart}
                            onSelect={() => { }}
                            invalidateRef={invalidateRef}
                        />
                    </Suspense>
                </Canvas>
            </div>
        </section>
    );
};

useGLTF.preload('/models/bg_dropoff-compressed.glb');

export default ModelCanvas;
