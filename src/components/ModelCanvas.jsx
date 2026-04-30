import {
    Canvas,
    useRef,
    useFrame,
    useState,
    useEffect,
    useGLTF,
    Environment,
    ContactShadows,
    CameraControls,
    CameraControlsImpl,
    Html,
    useProgress,
    Suspense,
} from "../imports.js";
import { Model as Model } from "./Instax12.jsx";

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
                left: CameraControlsImpl.ACTION.NONE,
                middle: CameraControlsImpl.ACTION.NONE,
                right: CameraControlsImpl.ACTION.NONE,
                wheel: CameraControlsImpl.ACTION.NONE,
            }}
        />
    );
}

function ScrollingModel({
    rotationTargetX,
    rotationTargetY,
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
        ref.current.rotation.x += (rotationTargetX.current - ref.current.rotation.x) * smoothing;
        ref.current.rotation.y += (rotationTargetY.current - ref.current.rotation.y) * smoothing;
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
    const isDragging = useRef(false);
    const lastPointerX = useRef(0);
    const lastPointerY = useRef(0);
    const rotationTargetX = useRef(0);
    const rotationTargetY = useRef(-Math.PI / 2);
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
            rotationTargetY.current += event.deltaY * 0.003;
        };

        node.addEventListener("wheel", handleWheel, { passive: false });
        return () => node.removeEventListener("wheel", handleWheel);
    }, []);

    return (
        <section className="model-canvas" id="model-canvas">
            <div className="model-canvas-content reveal">
                <h1 className="model-canvas-title">Capture The Moment</h1>
                <p className="model-canvas-description">Drag or scroll on the model panel to rotate the camera.</p>
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
                onPointerDown={(event) => {
                    isDragging.current = true;
                    lastPointerX.current = event.clientX;
                    lastPointerY.current = event.clientY;
                    event.currentTarget.setPointerCapture(event.pointerId);
                }}
                onPointerMove={(event) => {
                    if (!isDragging.current) return;

                    const deltaX = event.clientX - lastPointerX.current;
                    const deltaY = event.clientY - lastPointerY.current;
                    lastPointerX.current = event.clientX;
                    lastPointerY.current = event.clientY;
                    rotationTargetY.current += deltaX * 0.01;
                    rotationTargetX.current += deltaY * 0.01;
                }}
                onPointerUp={(event) => {
                    isDragging.current = false;

                    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                        event.currentTarget.releasePointerCapture(event.pointerId);
                    }
                }}
                onPointerCancel={(event) => {
                    isDragging.current = false;

                    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                        event.currentTarget.releasePointerCapture(event.pointerId);
                    }
                }}
            >
                <Canvas
                    camera={{ position: [0, 0.5, 5], fov: 38, near: 0.1, far: 100 }}
                    onPointerMissed={() => setSelectedPart(null)}
                >
                    <Suspense fallback={<ModelLoader />}>
                        <Environment
                            files="/kloofendal_48d_partly_cloudy_puresky_4k.exr"
                            background={false}
                        />
                        <Backdrop />
                        <ScrollingModel
                            scale={modelSize}
                            position={[0, 0, 0]}
                            rotationTargetX={rotationTargetX}
                            rotationTargetY={rotationTargetY}
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
