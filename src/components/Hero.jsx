import {
  Canvas,
  OrbitControls,
  useRef,
  useFrame,
  useEffect,
  Center,
} from "../imports.js";
import { Model as Instax12Model } from "./Instax12.jsx";


function ScrollingModel({ rotationTarget, ...groupProps }) {
  const ref = useRef();

  useFrame((_, delta) => {
    if (!ref.current) return;
    rotationTarget.current += delta * -0.5;
    const smoothing = Math.min(1, delta * 8);
    ref.current.rotation.y += (rotationTarget.current - ref.current.rotation.y) * smoothing;
  });

  return (
    <group ref={ref} {...groupProps}>
      <Center>
        <Instax12Model rotation={[Math.PI / -14, 0.2, 0]} />
      </Center>
    </group>
  );
}

const Hero = () => {
  const hero3dRef = useRef(null);
  const isPointerInside = useRef(false);
  const rotationTarget = useRef(0);
  const isDragging = useRef(false);
  const lastPointerX = useRef(0);
  const dragRotateSpeed = 0.01;

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

  useEffect(() => {
    const handlePointerMove = (event) => {
      if (!isDragging.current) return;
      const deltaX = event.clientX - lastPointerX.current;
      lastPointerX.current = event.clientX;
      rotationTarget.current += deltaX * dragRotateSpeed;
    };

    const endDrag = () => {
      isDragging.current = false;
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", endDrag);
    window.addEventListener("pointercancel", endDrag);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", endDrag);
      window.removeEventListener("pointercancel", endDrag);
    };
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
          isDragging.current = false;
        }}
        onPointerDown={(event) => {
          isDragging.current = true;
          lastPointerX.current = event.clientX;
        }}
      >
        <Canvas camera={{ position: [0, 1, 0], fov: 50 }}>
          <ambientLight intensity={1} />
          <directionalLight position={[2, 2, 2]} />

          <ScrollingModel position={[-0.15, 0.45, 0]} scale={0.4} rotationTarget={rotationTarget} />

          <OrbitControls enablePan={false} enableZoom={false} enableRotate={false} minDistance={2} maxDistance={3} />
        </Canvas>
      </div>
      <div className="hero-marquee">
        <div className="hero-marquee-track">
          <div className="hero-marquee-text">
            <span>Instax Mini 12</span>
            <span className="hero-marquee-separator">•</span>
            <span>Fill Your World With Joy</span>
            <span className="hero-marquee-separator">•</span>
            <span>Fujifilm</span>
            <span className="hero-marquee-separator">•</span>
            <span>Instant Photography</span>
            <span className="hero-marquee-separator">•</span>
          </div>

          <div className="hero-marquee-text">
            <span>Instax Mini 12</span>
            <span className="hero-marquee-separator">•</span>
            <span>Fill Your World With Joy</span>
            <span className="hero-marquee-separator">•</span>
            <span>Fujifilm</span>
            <span className="hero-marquee-separator">•</span>
            <span>Instant Photography</span>
            <span className="hero-marquee-separator">•</span>
          </div>
        </div>
      </div>
    </section>
  );
};
export default Hero;
