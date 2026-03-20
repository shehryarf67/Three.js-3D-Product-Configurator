import {
    Canvas,
    OrbitControls,
    useGLTF,
    useRef,
    useAnimations,
    useFrame,
    useEffect,
} from "../imports.js";
import { useMemo } from "react";
import { Box3, Vector3 } from "three";

function CameraModel(props) {
    const { scene, animations } = useGLTF('/models/pixel_polaroid_camera/scene.gltf');
    const groupRef = useRef();
    const { actions } = useAnimations(animations, groupRef);

    const centeredScene = useMemo(() => {
        const model = scene.clone(true);
        const box = new Box3().setFromObject(model);
        const center = new Vector3();
        box.getCenter(center);
        model.position.sub(center);
        return model;
    }, [scene]);

    useEffect(() => {
        if (!actions) return;
        const anim = Object.values(actions)[0];
        if (anim) anim.play();
    }, [actions]);

    return (
        <group ref={groupRef} {...props}>
            <primitive object={centeredScene} />
        </group>
    );
}

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
    const modelCanvasRef = useRef(null);
    const isPointerInside = useRef(false);
    const rotationTarget = useRef(0);

    useEffect(() => {
        const node = modelCanvasRef.current;
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
        <section
            className="model-canvas"
            id="model-canvas"
            ref={modelCanvasRef}
            onPointerEnter={() => {
                isPointerInside.current = true;
            }}
            onPointerLeave={() => {
                isPointerInside.current = false;
            }}
        >
            <Canvas camera={{ position: [0, 1, 3], fov: 50 }}>
                <ambientLight intensity={0.8} />
                <directionalLight position={[2, 2, 2]} />
                <ScrollingModel scale={0.7} position={[0, 0.8, 0]} rotationTarget={rotationTarget} />
                <OrbitControls enablePan={false} enableZoom={false} />
            </Canvas>
        </section>
    );
};

export default ModelCanvas;
