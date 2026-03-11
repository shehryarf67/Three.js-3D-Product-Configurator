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

            <DragControls>
              <Cube position={[0, 0, 0]} size={[1, 1, 1]} color="blue" />
            </DragControls>

            {/* <OrbitControls /> */}
          </Canvas>
        </div>

    </section>
  );
};

const Cube = ({ position, size, color }) => {
  const meshRef = useRef(null);
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);

  return (
    <mesh
      ref={meshRef}
      position={position}
      onPointerEnter={(event) => {
        event.stopPropagation();
        setHovered(true);
      }}
      onPointerLeave={() => {
        setHovered(false);
      }}
      onClick={(event) => {
        event.stopPropagation();
        setClicked(!clicked);
      }}
      scale={clicked ? 1.5 : 1}
    >
      <boxGeometry args={size} />
      <meshStandardMaterial color={hovered ? "limegreen" : color} />
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

    </div>
  );
}