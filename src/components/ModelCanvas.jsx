import { useState } from "react";
import {
    Canvas,
    OrbitControls,
    useRef,
    useFrame,
    useEffect,
    Environment,
    ContactShadows,
    useControls,
    Leva,
} from "../imports.js";
import { Model as SampleModel } from "./SampleCamera.jsx";

function ScrollingModel({
    rotationTarget,
    modelColor,
    onLensEnter,
    onLensLeave,
    isLensHovered,
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
        rotationTarget.current += delta * -0.15;
        const smoothing = Math.min(1, delta * 8);
        ref.current.rotation.y += (rotationTarget.current - ref.current.rotation.y) * smoothing;
    });

    return (
        <group ref={ref} rotation={[0, -Math.PI/2, 0]} {...groupProps}>
            <SampleModel 
                isLensHovered={isLensHovered}
                onLensEnter={onLensEnter}
                onLensLeave={onLensLeave}
            />
        </group>
    );
}


const ModelCanvas = () => {
    const model3dRef = useRef(null);
    const isPointerInside = useRef(false);
    const rotationTarget = useRef(-Math.PI/2);
    const [modelColor, setModelColor] = useState(null);
    const [modelSize, setModelSize] = useState([2, 2, 2]);
    const [isLensHovered, setIsLensHovered] = useState(false);

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
    
    const { intensity, lightX, lightY, lightZ } = useControls({
        intensity: { value: 10, min: 8, max: 15, step: 0.1 },
        lightX: { value: 2, min: -10, max: 10, step: 0.1 },
        lightY: { value: 2, min: -10, max: 10, step: 0.1 },
        lightZ: { value: 2, min: -10, max: 10, step: 0.1 },
    });
    return (
        <section className="model-canvas" id="model-canvas">
            <div className="model-canvas-content reveal">
                <h1 className="model-canvas-title">Capture The Moment</h1>
                <p className="model-canvas-description">Scroll on the model panel to rotate the camera.</p>
                <div className="toggle-button">
                    <button id="Color-toggler" onClick={() => setModelColor(modelColor === "#39FF14" ? null : "#39FF14")}>
                        Toggle Color
                    </button>
                    <button id="Size-toggler" onClick={() => setModelSize(modelSize[0] === 2 ? [3, 3, 3] : [2, 2, 2])}>
                        Change Size
                    </button>
                </div>
                {isLensHovered && (
                    <div className="lens-specs">
                        <p className="lens-specs-label">Lens Specs</p>
                        <h2 className="lens-specs-title">Digital Rangefinder Lens</h2>
                        <p className="lens-specs-text">
                            Multi-element front optic with a compact barrel profile, styled for a classic
                            rangefinder look and highlighted independently from the body.
                        </p>
                    </div>
                )}
            </div>
            <Leva/>
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
                <Canvas camera={{ position: [0, 1, 3], fov: 50 }}>
                    <color attach="background" args={['#0a0a0a']} />

                    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.8, 0]}>
                        <circleGeometry args={[2, 64]} />
                        <meshBasicMaterial color="#ffffff" transparent opacity={0.5} />
                    </mesh>

                    <ContactShadows
                        position={[0, 0.2, 0]}
                        opacity={1.5}
                        scale={5}
                        blur={1.5}
                        far={2}
                        color="#00000082"
                    />
                    <Environment preset="city" />
                    <ContactShadows opacity={0.4} scale={10} blur={2} far={10} />
                    <ambientLight intensity={2} />
                    <directionalLight position={[lightX, lightY, lightZ]} intensity={intensity} />
                    <ScrollingModel
                        scale={modelSize}
                        position={[-0.1, 0, 0]}
                        rotationTarget={rotationTarget}
                        modelColor={modelColor}
                        onLensEnter={() => setIsLensHovered(true)}
                        onLensLeave={() => setIsLensHovered(false)}
                        isLensHovered={isLensHovered}
                    />
                    <OrbitControls enablePan={false} enableZoom={false} />
                </Canvas>
            </div>
        </section>
    );
};

export default ModelCanvas;
