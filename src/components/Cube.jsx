import { useRef } from "../imports.js";

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

export default Cube;