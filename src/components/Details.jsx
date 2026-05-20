import { Model as Model } from "./Instax12.jsx";
import {
    Canvas,
    gsap,
    ScrollTrigger,
    useGSAP,
    useFrame,
    Suspense,
    useRef,
    useState,
    clsx,
    Html,
    useProgress,
    Environment,
} from "../imports.js";

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.normalizeScroll(true);

const features = [
    {
        title: "Auto Exposure System",
        description:
            "Measures ambient brightness and automatically sets shutter speed from 1/250 s in bright daylight down to 1/30 s in dim interiors. A dedicated Selfie Mode engages close-up exposure compensation the moment the selfie mirror slides out — no dials, no guesswork.",
    },
    {
        title: "60 mm f/12.7 Lens",
        description:
            "Fixed-focus 60 mm glass element at f/12.7 renders ISO 800 Instax Mini film with consistent sharpness from 0.6 m to infinity. Slide the built-in selfie mirror out and the optics reconfigure to lock focus between 30–50 cm for a pin-sharp self-portrait every time.",
    },
    {
        title: "Compact Rangefinder Body",
        description:
            "Iconic rounded shell at 106.8 × 121.7 × 67.3 mm and just 293 g fully loaded. The real-image optical viewfinder offers 0.37× magnification and ~82% field coverage. Ships in five signature pastel colorways: Blossom Pink, Mint Green, Lilac Purple, Clay White, and Baby Blue.",
    },
    {
        title: "Instax Mini Film",
        description:
            "Produces 54 × 86 mm credit-card-sized prints on ISO 800 Instax Mini film, developing in natural light within 90 seconds. Two AA alkaline batteries power up to 100 shots, and the built-in auto flash recycles in as little as 0.2 s.",
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

const MODEL_BASE_Y = 0.1;

const SpinningModel = () => {
    const floatRef = useRef(null);
    const spinRef = useRef(null);
    const [hoveredPart, setHoveredPart] = useState(null);

    useFrame((state, delta) => {
        if (spinRef.current) {
            spinRef.current.rotation.y += delta * 0.35;
        }
        if (floatRef.current) {
            floatRef.current.position.y =
                MODEL_BASE_Y + Math.sin(state.clock.elapsedTime * 0.6) * 0.1;
        }
    });

    return (
        <group ref={floatRef} position={[1.5, MODEL_BASE_Y, 0]} rotation={[0.22, 0, -0.14]}>
            <group ref={spinRef}>
                <Suspense fallback={<ModelLoader />}>
                    <Model
                        hoveredPart={hoveredPart}
                        setHoveredPart={setHoveredPart}
                        onSelect={() => {}}
                        position={[0, 0, 0]}
                        rotation={[0, 0, 0]}
                        scale={[0.32, 0.32, 0.32]}
                    />
                </Suspense>
            </group>
        </group>
    );
};

const Details = () => {
    const sectionRef = useRef(null);

    useGSAP(() => {
        gsap.set(".feature-card", { xPercent: -115 });

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: sectionRef.current,
                start: "top top",
                end: `+=${features.length * 550}`,
                scrub: 0.5,
                pin: true,
                pinSpacing: true,
                fastScrollEnd: true,
                invalidateOnRefresh: true,
            },
        });

        tl.from(
            "#details-canvas",
            { opacity: 0, scale: 0.85, ease: "power2.out", duration: 0.7 },
            0
        );
        tl.from(
            ".scroll-indicator",
            { opacity: 0, y: -24, ease: "power2.out", duration: 0.5 },
            0.15
        );
        tl.to(
            ".feature-card-1",
            { xPercent: 0, ease: "power2.out", duration: 0.55 },
            0.2
        );

        for (let i = 1; i < features.length; i++) {
            tl.to(
                `.feature-card-${i}`,
                { xPercent: -115, ease: "power2.in", duration: 0.5 },
                "+=0.8"
            ).to(
                `.feature-card-${i + 1}`,
                { xPercent: 0, ease: "power2.out", duration: 0.5 },
                "<+0.15"
            );
        }

        tl.addLabel("hold", "+=0.8");

        ScrollTrigger.refresh();
    }, { scope: sectionRef });

    return (
        <section className="details" id="details" ref={sectionRef}>
            <div className="details-stage">
                <Canvas
                    id="details-canvas"
                    frameloop="always"
                    dpr={[1, 1.5]}
                    gl={{ powerPreference: "high-performance", antialias: false }}
                    camera={{ position: [0, 0.5, 7], fov: 38 }}
                >
                    <Environment background={false} preset="warehouse" />
                    <directionalLight position={[2, 2, 2]} intensity={1} />
                    <SpinningModel />
                </Canvas>

                <div className="feature-cards">
                    {features.map((feature, index) => (
                        <article
                            key={feature.title}
                            className={clsx("feature-card", `feature-card-${index + 1}`)}
                        >
                            <h3 className="feature-card-title">{feature.title}</h3>
                            <p className="feature-card-description">{feature.description}</p>
                        </article>
                    ))}
                </div>

                <div className="scroll-indicator" aria-hidden="true">
                    <span className="scroll-indicator-text">scroll</span>
                    <span className="scroll-indicator-line" />
                </div>
            </div>
        </section>
    );
};

export default Details;
