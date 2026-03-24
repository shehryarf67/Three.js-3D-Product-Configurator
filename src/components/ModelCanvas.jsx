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

function ScrollingModel({ rotationTarget, ...groupProps }) {
    const ref = useRef();

    useFrame((_, delta) => {
        if (!ref.current) return;
        const smoothing = Math.min(1, delta * 8);
        ref.current.rotation.y += (rotationTarget.current - ref.current.rotation.y) * smoothing;
    });

    return (
        <group ref={ref} {...groupProps}>
            <CameraModel />
        </group>
    );
}

const ModelCanvas = () => {
    const model3dRef = useRef(null);
    const isPointerInside = useRef(false);
    const rotationTarget = useRef(0);

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
                    <Environment preset="city" />
                    <ContactShadows opacity={0.4} scale={10} blur={2} far={10} />
                    <ambientLight intensity={0.8} />
                    <directionalLight position={[2, 2, 2]} />
                    <ScrollingModel scale={1} position={[0, 0.4, 0]} rotationTarget={rotationTarget} />
                    <OrbitControls enablePan={false} enableZoom={false} />
                </Canvas>
            </div>
        </section>
    );
};

export default ModelCanvas;
