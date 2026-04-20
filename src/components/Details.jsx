import { Model as SampleModel } from "./SampleCamera.jsx";
import { Canvas, gsap, ScrollTrigger, useGSAP, Suspense, useRef, useState, clsx, Html, useProgress, Environment, ContactShadows } from "../imports.js";

gsap.registerPlugin(ScrollTrigger);

const features = [
    {
        title: "High-Resolution Sensor",
        description: "Capture stunning details with our high-resolution sensor.",
        position: { top: "14%", left: "2%" },      // top left
    },
    {
        title: "Premium Lens",
        description: "Multi-element optics for razor-sharp imagery.",
        position: { top: "28%", right: "2%" },     // top right, a bit lower
    },
    {
        title: "Rangefinder Body",
        description: "Classic silhouette built for comfort and precision.",
        position: { bottom: "28%", left: "2%" },   // bottom left
    },
    {
        title: "Stable Base",
        description: "Engineered base for balance and secure handling.",
        position: { bottom: "14%", right: "2%" },   // bottom right, a bit lower
    },
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

        featureTimeline
        .to('.box1', { opacity: 1, y: 0, duration: 1 })
        .to('.box2', { opacity: 1, y: 0, duration: 1 })
        .to('.box3', { opacity: 1, y: 0, duration: 1 })
        .to('.box4', { opacity: 1, y: 0, duration: 1 })

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
                    onSelect={() => { }}
                    position={[-0.5, 0, 0]}
                    rotation={[0, -Math.PI / 2, 0]}
                    scale={[2, 2, 2]}
                />
            </Suspense>
        </group>
    )
}

const Details = () => {
    return (
        <section className="details" id="details">
            <div className="details-stage">
                <Canvas
                    id="details-canvas"
                    shadows
                    camera={{ position: [0, 1, 3], fov: 50 }}
                >
                    <Environment preset="warehouse" />
                    <ContactShadows opacity={0.4} scale={10} blur={2} far={10} />
                    <ambientLight intensity={3} />
                    <directionalLight position={[2, 2, 2]} intensity={10} />
                    <ModelScroll />
                </Canvas>

                <div className="details-overlay">
                    <h2>The Fun Filming</h2>

                    <div className="details-boxes">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className={clsx("box", `box${index + 1}`)}
                                style={feature.position} 
                            >
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
