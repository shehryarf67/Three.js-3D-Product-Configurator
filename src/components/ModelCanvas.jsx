import {
    Canvas,
    useRef,
    useFrame,
    useEffect,
    Environment,
    ContactShadows,
    CameraControls,
    CameraControlsImpl,
    Html,
    useProgress,
    Suspense,
} from "../imports.js";
import { useState } from "react";
import { Model as Model } from "./Instax12.jsx";

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

function CameraRig({ selectedPart }) {
    const controlsRef = useRef();

    useEffect(() => {
        if (!controlsRef.current) return;

        if (selectedPart === "lens") {
            controlsRef.current.setLookAt(
                1.2, 1.1, 4,
                0, 0, 0,
                true
            );
        } else if (selectedPart === "body") {
            controlsRef.current.setLookAt(
                2.8, 0.8, 4,
                0, 0, 0,
                true
            );
        } else if (selectedPart === "sockel") {
            controlsRef.current.setLookAt(
                2.4, 0.2, 4,
                0, 0, 0,
                true
            );
        } else {
            controlsRef.current.setLookAt(
                0, 0.9, 6.5,
                0, 0, 0,
                true
            );
        }
    }, [selectedPart]);

    return (
        <CameraControls
            ref={controlsRef}
            minDistance={3}
            maxDistance={9}
            nearPlane={0.1}
            mouseButtons={{
                left: CameraControlsImpl.ACTION.ROTATE,
                middle: CameraControlsImpl.ACTION.NONE,
                right: CameraControlsImpl.ACTION.NONE,
                wheel: CameraControlsImpl.ACTION.NONE,
            }}
        />
    );
}

function ScrollingModel({
    rotationTarget,
    modelColor,
    hoveredPart,
    setHoveredPart,
    onSelect,
    ...groupProps
}) {
    const ref = useRef();

    useEffect(() => {
        if (!ref.current) return;

        ref.current.traverse((child) => {
            if (!child.isMesh || !child.material) return;

            const materials = Array.isArray(child.material) ? child.material : [child.material];

            materials.forEach((material) => {
                if (!material || material.name !== "KameraMat" || !material.color) return;

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
    }, [modelColor]);

    useFrame((_, delta) => {
        if (!ref.current) return;
        const smoothing = Math.min(1, delta * 8);
        ref.current.rotation.y += (rotationTarget.current - ref.current.rotation.y) * smoothing;
    });

    return (
        <group ref={ref} rotation={[0, -Math.PI / 2, 0]} {...groupProps}>
            <Model
                hoveredPart={hoveredPart}
                setHoveredPart={setHoveredPart}
                onSelect={onSelect}
            />
        </group>
    );
}


const ModelCanvas = () => {
    const model3dRef = useRef(null);
    const isPointerInside = useRef(false);
    const rotationTarget = useRef(-Math.PI / 2);
    const [modelColor, setModelColor] = useState(null);
    const modelSize = [0.55, 0.55, 0.55];
    const [hoveredPart, setHoveredPart] = useState(null);
    const [selectedPart, setSelectedPart] = useState(null);
    const colors = [
        { name: "Lime Green", value: "#39FF14" },
        { name: "Blue", value: "#1E90FF" },
        { name: "Red", value: "#FF3131" },
        { name: "Yellow", value: "#FFD60A" },
        { name: "Pink", value: "#FF4FD8" },
        { name: "Default", value: null },
    ]

    useEffect(() => {
        const node = model3dRef.current;
        if (!node) return;

        const handleWheel = (event) => {
            if (!isPointerInside.current) return;
            event.preventDefault();
            event.stopPropagation();
            rotationTarget.current += event.deltaY * 0.003;
        };

        node.addEventListener("wheel", handleWheel, { passive: false });
        return () => node.removeEventListener("wheel", handleWheel);
    }, []);

    return (
        <section className="model-canvas" id="model-canvas">
            <div className="model-canvas-content reveal">
                <h1 className="model-canvas-title">Capture The Moment</h1>
                <p className="model-canvas-description">Scroll on the model panel to rotate the camera.</p>
                <div className="color-palette">
                    {colors.map((color) => (
                        <button
                            key={color.name}
                            className={`swatch ${modelColor === color.value ? "active" : ""}`}
                            style={{ background: color.value ?? "#333333" }}
                            title={color.name}
                            onClick={() => setModelColor(color.value)}
                        />
                    ))}
                </div>
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
            </div>
            <div
                className="model-3d"
                ref={model3dRef}
                onPointerEnter={() => {
                    isPointerInside.current = true;
                }}
                onPointerLeave={() => {
                    isPointerInside.current = false;
                }}
            >
                <Canvas
                    camera={{ position: [0, 0.5, 5], fov: 38, near: 0.1, far: 100 }}
                    onPointerMissed={() => setSelectedPart(null)}
                >
                    <color attach="background" args={['#0d0d0d']} />

                    <ContactShadows
                        position={[0, -0.85, 0]}
                        opacity={0.5}
                        scale={3}
                        blur={1}
                        far={1}
                        color="#4444ff"    // ← slight blue tint looks premium
                    />

                    <Environment preset="studio" />   {/* ← studio > warehouse for product shots */}
                    {/* <ambientLight intensity={1} />  ← reduce from 3, overkill */}
                    {/* <directionalLight position={[-2, 4, 3]} intensity={2} />   ← reposition light */}
                    {/* <directionalLight position={[3, 2, -2]} intensity={1} />   ← fill light from right */}

                    <Suspense fallback={<ModelLoader />}>
                        <ScrollingModel
                            scale={modelSize}
                            position={[0, -0.5, 0]}   // ← center it, was offset -0.1
                            rotationTarget={rotationTarget}
                            modelColor={modelColor}
                            hoveredPart={hoveredPart}
                            setHoveredPart={setHoveredPart}
                            onSelect={setSelectedPart}
                        />
                    </Suspense>
                    <CameraRig selectedPart={selectedPart} />
                </Canvas>
            </div>
        </section>
    );
};

export default ModelCanvas;
