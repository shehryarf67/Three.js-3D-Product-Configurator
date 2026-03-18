import { Canvas, OrbitControls, useState, useGLTF } from "../imports.js";
import { Cube } from "./index.js";

function CameraModel(props) {
  const { scene } = useGLTF('/models/pixel_polaroid_camera/scene.gltf')
  return <primitive object={scene} {...props} />
}


const Hero = () => {

  return (
    <section className="hero" id="home">
      <div className="hero-content reveal">
        <h1 className="hero-title">Fill Your<br /> World<br /> With Joy</h1>
        <p className="hero-description">3D Camera Models</p>
      </div>
      <div className="hero-3d" id="canvas">
        <Canvas camera={{ position: [0, 1, 3], fov: 50 }}>
          <ambientLight intensity={1} />
          <directionalLight position={[2, 2, 2]} />

          <CameraModel scale={1.2} position={[-1, 0.2, 0]} />

          <OrbitControls enablePan={false} minDistance={2} maxDistance={6} />
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
