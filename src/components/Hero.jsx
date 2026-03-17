import { Canvas, OrbitControls, useState } from "../imports.js";
import { Cube } from "./index.js";

const Hero = () => {
  
  return (
    <section className="hero" id="home">
      <div className="hero-content">
        <h1 className="hero-title">Discover the Future of 3D Product Visualization</h1>
        <p className="hero-description">Experience your products like never before with our cutting-edge 3D visualization platform. Explore every angle, customize in real-time, and captivate your audience with stunning interactive displays.</p>
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