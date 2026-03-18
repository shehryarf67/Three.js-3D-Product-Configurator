import {
  Canvas,
  OrbitControls,
  useState,
  useRef,
  useGLTF,
  useFrame,
} from "../imports.js";
import { useEffect } from "react";
import { Cube } from "./index.js";

function CameraModel(props) {
  const { scene } = useGLTF('/models/pixel_polaroid_camera/scene.gltf')
  return <primitive object={scene} {...props} />
}


function ScrollingModel({rotationTarget, ...props}) {
  const ref = useRef();

  useFrame((_, delta) => {
    if (!ref.current) return;
    const smoothing = Math.min(1, delta * 8);
    ref.current.rotation.y += (rotationTarget.current - ref.current.rotation.y) * smoothing;
  });

  return (
    <group ref={ref}>
      <CameraModel {...props} />
    </group>
  );
}

const Hero = () => {
  const hero3dRef = useRef(null);
  const isPointerInside = useRef(false);
  const rotationTarget = useRef(0);

  useEffect(() => {
    const node = hero3dRef.current;
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
    <section className="hero" id="home">
      <div className="hero-content reveal">
        <h1 className="hero-title">Fill Your<br /> World<br /> With Joy</h1>
        <p className="hero-description">3D Camera Models</p>
      </div>
      <div
        className="hero-3d"
        id="canvas"
        ref={hero3dRef}
        onPointerEnter={() => {
          isPointerInside.current = true;
        }}
        onPointerLeave={() => {
          isPointerInside.current = false;
        }}
      >
        <Canvas camera={{ position: [0, 1, 3], fov: 50 }}>
          <ambientLight intensity={1} />
          <directionalLight position={[2, 2, 2]} />

          <ScrollingModel position={[-0.4, 0, 0]} scale={1.3} rotationTarget={rotationTarget} />

          <OrbitControls enablePan={false} enableZoom={false} minDistance={2} maxDistance={6} />
        </Canvas>
      </div>

    </section>
  );
};
export default Hero;

const Extra = () => {
  const [cubeColor, setCubeColor] = useState("red");
  const [cubeSize, setCubeSize] = useState([1, 1, 1]);
  return (
    <section>
      <div className="hero-3d" id="canvas">
        <Canvas camera={{ position: [2, 2, 2], fov: 80 }}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 5, 5]} intensity={1} />
          {/* <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} castShadow /> */}

          <OrbitControls minDistance={2} maxDistance={4} />
          <Cube position={[0, 0, 0]} size={cubeSize} color={cubeColor} />

        </Canvas>
      </div>

      <div className="toggle-button">
        <button id="Color-toggler" onClick={() => setCubeColor(cubeColor === "red" ? "limegreen" : "red")}>
          Toggle Color
        </button>
        <button id="Size-toggler" onClick={() => setCubeSize(cubeSize[0] === 1 ? [2, 2, 2] : [1, 1, 1])}>
          Change Size
        </button>
      </div>
    </section>
  );
}
