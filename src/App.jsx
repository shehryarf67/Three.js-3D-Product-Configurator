import { Canvas } from "@react-three/fiber";
import { OrbitControls, DragControls } from "@react-three/drei";
import { useRef, useState } from "react";
import { IoLogoCodepen } from "react-icons/io";
import { Leva, useControls } from "leva";

const Navbar = () => {
  const handleNavClick = (label, e) => {
    if (label === "About") {
      e.preventDefault();
      document.getElementById("about").scrollIntoView({ behavior: "smooth" });
    }
    else if (label === "Home") {
      e.preventDefault();
      document.getElementById("canvas").scrollIntoView({ behavior: "smooth" });
    }
  };

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
              <a href="#" onClick={(e) => handleNavClick(item.label, e)}>{item.label}</a>
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

const About = () => {
  return (
    <section className="about" id="about">
      <h1>About This Project</h1>
      <p>
        This project demonstrates how to create an interactive 3D scene using React Three Fiber. It includes a simple cube that can be manipulated with buttons to change its color and size, as well as orbit controls for navigation.
      </p>
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

const CircleFloating = () => {
  return (
    <>
      <div className="floating-circle circle-1"></div>
      <div className="floating-circle circle-2"></div>
      <div className="floating-circle circle-3"></div>
      <div className="floating-circle circle-4"></div>
      <div className="floating-circle circle-5"></div>
    </>
  );
}

export default function App() {
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Navbar />
      <CircleFloating />
      <Hero />
      <About />
      <div className="footer">© 2026 My Three.js Scene</div>
    </div>
  );
}