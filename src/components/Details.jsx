import { Model as SampleModel } from "./SampleCamera.jsx";
import { Canvas, gsap, ScrollTrigger, useGSAP, Suspense, useRef, useState, clsx, Html, useProgress, Environment, ContactShadows } from "../imports.js";

gsap.registerPlugin(ScrollTrigger);

const features = [
    {
        title: "High-Resolution Sensor",
        description: "Capture stunning details with our advanced high-resolution sensor, engineered to deliver crisp, vibrant images even in challenging lighting conditions.",
        position: { top: "18%", left: "10%" },
    },
    {
        title: "Premium Lens",
                description: "Multi-element front optic with precision-ground glass delivers razor-sharp imagery with beautiful natural bokeh and minimal chromatic aberration.",
        position: { top: "30%", right: "8%" },
    },
    {
        title: "Rangefinder Body",
        description: "The classic rangefinder silhouette is built for all-day comfort and precision handling, combining a sturdy metal shell with a leather-inspired textured grip.",
        position: { bottom: "26%", left: "10%" },
    },
    {
        title: "Stable Base",
        description: "Engineered base plate provides exceptional balance and secure handling, with a standard tripod mount for studio and outdoor shooting versatility.",
        position: { bottom: "18%", right: "8%" },
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
                    <p className="details-intro">
                        Experience the thrill of capturing every moment with our cutting-edge camera technology.
                    </p>

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
