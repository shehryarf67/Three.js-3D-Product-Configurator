import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useRef } from "react";

const Cube = ({ position, size, color }) => {
  const meshRef = useRef(null);

  return (
    <mesh
      ref={meshRef}
      position={position}
      onPointerEnter={() => {
        if (meshRef.current) {
          meshRef.current.material.color.set("hotpink");
        }
      }}
      onPointerLeave={() => {
        if (meshRef.current) {
          meshRef.current.material.color.set(color);
        }
      }}
    >
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} />
    </mesh>
  )
}

export default function App() {
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Canvas camera={{ position: [2, 2, 2], fov: 80 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <Cube position={[1, 0, 0]} size={[1, 1, 1]} color="blue" />
        {/* <OrbitControls /> */}
      </Canvas>
    </div>
  );
}
