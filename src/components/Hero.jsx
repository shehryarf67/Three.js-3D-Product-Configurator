import { Canvas, OrbitControls, useState } from "../imports.js";
import { Cube } from "./index.js";

const Hero = () => {
  const [cubeColor, setCubeColor] = useState("red");
  const [cubeSize, setCubeSize] = useState([1, 1, 1]);

  return (
    <section className="hero">

      <div className="hero-content">

        <h1>Interactive 3D Product Experiences</h1>

        <p>
          Check out different products using a 3D immersive experience.
        </p>

        <div className="hero-buttons">
          <button onClick={() => document.getElementById('canvas').scrollIntoView({ behavior: 'smooth' })}>Get Started</button>
          <button onClick={() => document.getElementById('about').scrollIntoView({ behavior: 'smooth' })}>Learn More</button>
        </div>

      </div>

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
};

export default Hero;