import { Canvas } from "@react-three/fiber";
import { OrbitControls, DragControls } from "@react-three/drei";
import { useRef, useState } from "react";
import { IoLogoCodepen } from "react-icons/io";

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
      <meshStandardMaterial color={hovered ? "hotpink" : color} />
    </mesh>
  );
};

export default function App() {
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Navbar />
      <Canvas camera={{ position: [2, 2, 2], fov: 80 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1} />

        <DragControls>
          <Cube position={[1, 0, 0]} size={[1, 1, 1]} color="blue" />
        </DragControls>

        <OrbitControls />
      </Canvas>
    </div>
  );
}