import { Model as SampleModel } from "./SampleCamera.jsx";
import { Canvas, gsap, ScrollTrigger, useGSAP, Suspense, useRef, useState, clsx, Html, useProgress, Environment, ContactShadows } from "../imports.js";

gsap.registerPlugin(ScrollTrigger);

const features = [
    {
        title: "High-Resolution Sensor",
        description: "Capture stunning details with our high-resolution sensor.",
        styles: "",
    }
];

function ModelLoader() {
    const { progress } = useProgress();

    return (
        <Html center>
            <div className="model-loader">
                <div className="model-loader__ring" />
                <p className="model-loader__label">Loading camera...</p>
                <span className="model-loader__progress">{Math.round(progress)}%</span>
            </div>
        </Html>
    );
}

const ModelScroll = () => {
    const groupRef = useRef(null);
    const [hoveredPart, setHoveredPart] = useState(null);

    useGSAP(() => {
        const modelTimeline = gsap.timeline({
            scrollTrigger: {
                trigger: '#details-canvas',
                start: "top top",
                end: "bottom top",
                scrub: true,
                pin: true,
            }
        });

        const featureTimeline = gsap.timeline({
            scrollTrigger: {
                trigger: '#details-canvas',
                start: "top center",
                end: "bottom top",
                scrub: true,
            }
        });
        
        if (groupRef.current) {
            modelTimeline.to(groupRef.current.rotation, { y: Math.PI * 2, ease: "power1.inOut" });
        }
    }, []);

    return (
        <group ref={groupRef}>
            <Suspense fallback={<ModelLoader />}>
                <SampleModel
                    hoveredPart={hoveredPart}
                    setHoveredPart={setHoveredPart}
                    onSelect={() => {}}
                    position={[-0.5, 0.3, 0]}
                    rotation={[0, -Math.PI / 2, 0]}
                    scale={[2, 2, 2]}
                />
            </Suspense>
        </group>
    )
}

const Details = () => {
    return (
        <section className="details">
            <div className="details-stage">
                <Canvas
                    id="details-canvas"
                    shadows
                    camera={{ position: [0, 1, 3], fov: 50 }}
                >
                    <ambientLight intensity={3} />
                    <directionalLight position={[3.5, 4, 2.5]} intensity={2.2} castShadow />
                    <Environment preset="studio" />
                    <ModelScroll />
                </Canvas>

                <div className="details-overlay">
                    <h2>The Fun Filming</h2>

                    <div className="details-boxes">
                        {features.map((feature, index) => (
                            <div key={index} className={clsx("box", `box${index + 1}`, feature.styles)}>
                                <h3>{feature.title}</h3>
                                <p>{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Details;
