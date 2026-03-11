import { Canvas } from "@react-three/fiber";
import { OrbitControls, DragControls } from "@react-three/drei";
import { useRef, useState } from "react";
import { IoLogoCodepen } from "react-icons/io";
import { Leva, useControls } from "leva";

const Navbar = () => {
  return (
    <header>
      <nav>
        <IoLogoCodepen size={64} />
        <ul>
          {[
            { label: "Home" },
            { label: "About" },
            { label: "Contact" },
          ].map((item) => (
            <li key={item.label}>
              <a href={item.label}>{item.label}</a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
};

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
          <button>Get Started</button>
          <button>Learn More</button>
        </div>

      </div>

      <div className="hero-3d">
          <Canvas camera={{ position: [2, 2, 2], fov: 80 }}>
            <ambientLight intensity={0.6} />
            <directionalLight position={[5, 5, 5]} intensity={1} />
            {/* <SceneLights /> */}
            {/* <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} castShadow /> */}

            <OrbitControls minDistance={2} maxDistance={4}/>
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

const Cube = ({ position, size, color }) => {
  const meshRef = useRef(null);

  return (
    <mesh
      ref={meshRef}
      position={position}
    >
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
};

function SceneLights() {
  const { intensity, x, y, z, color } = useControls("Light", {
    intensity: { value: 1, min: 0, max: 5, step: 0.1 },
    x: { value: 5, min: -10, max: 10, step: 0.1 },
    y: { value: 5, min: -10, max: 10, step: 0.1 },
    z: { value: 5, min: -10, max: 10, step: 0.1 },
    color: "#ffffff",
  });

  return (
    <directionalLight
      intensity={intensity}
      position={[x, y, z]}
      color={color}
    />
  );
}

export default function App() {
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Navbar />
      <Hero />
      <div className="footer">© 2026 My Three.js Scene</div>

    </div>
    
  );
}