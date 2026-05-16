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
        title: "Auto Exposure System",
        description: "Measures ambient brightness and automatically sets shutter speed from 1/250 s in bright daylight down to 1/30 s in dim interiors. A dedicated Selfie Mode engages close-up exposure compensation the moment the selfie mirror slides out, keeping skin tones warm and consistent across every shot — no dials, no guesswork.",
        position: { top: "18%", left: "4%" },
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="4.5" />
                <path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" />
            </svg>
        ),
    },
    {
        title: "60 mm f/12.7 Lens",
        description: "Fixed-focus 60 mm glass element at f/12.7 renders ISO 800 Instax Mini film with consistent sharpness from 0.6 m to infinity in standard mode. Slide the built-in selfie mirror out and the optics reconfigure to lock focus between 30–50 cm, giving you a perfectly framed, pin-sharp self-portrait every time.",
        position: { top: "30%", right: "4%" },
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9.5" />
                <circle cx="12" cy="12" r="3.5" />
                <path d="M12 2.5V8M12 16v5.5M2.5 12H8M16 12h5.5" />
            </svg>
        ),
    },
    {
        title: "Compact Rangefinder Body",
        description: "Iconic rounded shell at 106.8 × 121.7 × 67.3 mm and just 293 g fully loaded. The real-image optical viewfinder offers 0.37× magnification and approximately 82% field coverage for accurate, parallax-minimised framing. Ships in five signature pastel colorways: Blossom Pink, Mint Green, Lilac Purple, Clay White, and Baby Blue.",
        position: { bottom: "26%", left: "4%" },
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
            </svg>
        ),
    },
    {
        title: "Instax Mini Film",
        description: "Produces 54 × 86 mm credit-card-sized prints on ISO 800 Instax Mini film, developing in natural light within 90 seconds. Two AA alkaline batteries power up to 100 shots per charge. The built-in auto flash (guide number 5.1) fires in every mode and recycles in as little as 0.2 s — so you never miss the moment.",
        position: { bottom: "18%", right: "4%" },
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="2" width="18" height="20" rx="2.5" />
                <rect x="5.5" y="4.5" width="13" height="9" rx="1" />
                <circle cx="8.5" cy="17.5" r="1" fill="currentColor" stroke="none" />
                <circle cx="12" cy="17.5" r="1" fill="currentColor" stroke="none" />
                <circle cx="15.5" cy="17.5" r="1" fill="currentColor" stroke="none" />
            </svg>
        ),
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
                    <h2 className="reveal">The Fun Filming</h2>
                    <p className="details-intro reveal">
                        Experience the thrill of capturing every moment with our cutting-edge camera technology.
                    </p>

                    <div className="details-boxes">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className={clsx("box", `box${index + 1}`)}
                                style={feature.position}
                            >
                                <div className="box-header">
                                    <span className="box-icon">{feature.icon}</span>
                                    <h3>{feature.title}</h3>
                                </div>
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
