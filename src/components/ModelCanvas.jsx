import { useState } from "react";
import {
    Canvas,
    OrbitControls,
    useRef,
    useFrame,
    useEffect,
    Environment,
    ContactShadows,
} from "../imports.js";
import { Model as CameraModel } from "./Camera.jsx";
import { Model as SampleModel } from "./SampleCamera.jsx";

function ScrollingModel({ rotationTarget, modelColor, ...groupProps }) {
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
        <group ref={ref} rotation={[0, -Math.PI/2, 0]} {...groupProps}>
            <SampleModel />
        </group>
    );
}

const ModelCanvas = () => {
    const model3dRef = useRef(null);
    const isPointerInside = useRef(false);
    const rotationTarget = useRef(-Math.PI/2);
    const [modelColor, setModelColor] = useState(null);
    const [modelSize, setModelSize] = useState([2, 2, 2]);

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
                <div className="toggle-button">
                    <button id="Color-toggler" onClick={() => setModelColor(modelColor === "aqua" ? null : "aqua")}>
                        Toggle Color
                    </button>
                    <button id="Size-toggler" onClick={() => setModelSize(modelSize[0] === 2 ? [3, 3, 3] : [2, 2, 2])}>
                        Change Size
                    </button>
                </div>
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
                    <directionalLight position={[2, 2, 2]} intensity={10}/>
                    <ScrollingModel
                        scale={modelSize}
                        position={[-0.1, 0, 0]}
                        rotationTarget={rotationTarget}
                        modelColor={modelColor}
                    />
                    <OrbitControls enablePan={false} enableZoom={false} />
                </Canvas>
            </div>
        </section>
    );
};

export default ModelCanvas;
