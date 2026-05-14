import { Model as Model } from "./Instax12.jsx";
import { Canvas, gsap, ScrollTrigger, useGSAP, useThree, useEffect, Suspense, useRef, useState, clsx, Html, useProgress, Environment, ContactShadows } from "../imports.js";

gsap.registerPlugin(ScrollTrigger);

function InvalidateBridge({ invalidateRef }) {
    const { invalidate } = useThree();
    useEffect(() => {
        invalidateRef.current = invalidate;
    }, [invalidate]);
    return null;
}

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

const ModelScroll = ({ invalidateRef }) => {
    const groupRef = useRef(null);
    const [hoveredPart, setHoveredPart] = useState(null);

    useGSAP(() => {
        const onUpdate = () => invalidateRef.current();

        const modelTimeline = gsap.timeline({
            scrollTrigger: {
                trigger: '#details-canvas',
                start: "top top",
                end: "bottom top",
                scrub: true,
                pin: true,
                onUpdate,
            }
        });

        const featureTimeline = gsap.timeline({
            scrollTrigger: {
                trigger: '#details-canvas',
                start: "top center",
                end: "bottom top",
                scrub: true,
                onUpdate,
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
        <group position={[-0.7, 0, 0]}>
            <group ref={groupRef}>
                <Suspense fallback={<ModelLoader />}>
                    <Model
                        hoveredPart={hoveredPart}
                        setHoveredPart={setHoveredPart}
                        onSelect={() => { }}
                        position={[0, 0, 0]}
                        rotation={[0, 0, 0]}
                        scale={[0.55, 0.55, 0.55]}
                    />
                </Suspense>
            </group>
        </group>
    )
}

const Details = () => {
    const invalidateRef = useRef(() => {});

    return (
        <section className="details" id="details">
            <div className="details-stage">
                <Canvas
                    id="details-canvas"
                    frameloop="demand"
                    camera={{ position: [0, 0.5, 7], fov: 38 }}
                >
                    <InvalidateBridge invalidateRef={invalidateRef} />
                    <Environment background={false} preset="warehouse" />
                    <directionalLight position={[2, 2, 2]} intensity={1} />
                    <ModelScroll invalidateRef={invalidateRef} />
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
