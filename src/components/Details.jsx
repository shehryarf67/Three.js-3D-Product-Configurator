import { Model as Model } from "./Instax12.jsx";
import {
    Canvas,
    gsap,
    ScrollTrigger,
    useGSAP,
    useFrame,
    useThree,
    Suspense,
    useRef,
    useState,
    useEffect,
    clsx,
    Html,
    useProgress,
    Environment,
    useMediaQuery,
} from "../imports.js";

gsap.registerPlugin(ScrollTrigger);

const features = [
    {
        title: "Auto Exposure System",
        description:
            "Measures ambient brightness and automatically sets shutter speed from 1/250 s in bright daylight down to 1/30 s in dim interiors. A dedicated Selfie Mode engages close-up exposure compensation the moment the selfie mirror slides out - no dials, no guesswork.",
    },
    {
        title: "60 mm f/12.7 Lens",
        description:
            "Fixed-focus 60 mm glass element at f/12.7 renders ISO 800 Instax Mini film with consistent sharpness from 0.6 m to infinity. Slide the built-in selfie mirror out and the optics reconfigure to lock focus between 30-50 cm for a pin-sharp self-portrait every time.",
    },
    {
        title: "Compact Rangefinder Body",
        description:
            "Iconic rounded shell at 106.8 x 121.7 x 67.3 mm and just 293 g fully loaded. The real-image optical viewfinder offers 0.37x magnification and ~82% field coverage. Ships in five signature pastel colorways: Blossom Pink, Mint Green, Lilac Purple, Clay White, and Baby Blue.",
    },
    {
        title: "Instax Mini Film",
        description:
            "Produces 54 x 86 mm credit-card-sized prints on ISO 800 Instax Mini film, developing in natural light within 90 seconds. Two AA alkaline batteries power up to 100 shots, and the built-in auto flash recycles in as little as 0.2 s.",
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

const DETAILS_MODEL_FRAME_MS = 1000 / 30;

const SpinningModel = ({ baseX, baseY, modelScale }) => {
    const modelGroupRef = useRef(null);
    const spinRef = useRef(null);
    const floatTimeRef = useRef(0);
    const frameTimerRef = useRef(null);
    const [hoveredPart, setHoveredPart] = useState(null);
    const { invalidate } = useThree();

    const scheduleNextFrame = () => {
        if (frameTimerRef.current !== null || typeof window === "undefined") return;
        frameTimerRef.current = window.setTimeout(() => {
            frameTimerRef.current = null;
            invalidate();
        }, DETAILS_MODEL_FRAME_MS);
    };

    useEffect(() => {
        invalidate();
        return () => {
            if (frameTimerRef.current !== null) {
                window.clearTimeout(frameTimerRef.current);
            }
        };
    }, [invalidate]);

    useFrame((_, delta) => {
        floatTimeRef.current += delta;

        if (spinRef.current) {
            spinRef.current.rotation.y += delta * 0.35;
        }
        if (modelGroupRef.current) {
            const targetY = baseY + Math.sin(floatTimeRef.current * 1.15) * 0.055;
            modelGroupRef.current.position.y +=
                (targetY - modelGroupRef.current.position.y) * Math.min(1, delta * 7);
        }

        scheduleNextFrame();
    });

    return (
        <group
            ref={modelGroupRef}
            position={[baseX, baseY, 0]}
            rotation={[0.22, 0, -0.14]}
        >
            <group ref={spinRef}>
                <Suspense fallback={<ModelLoader />}>
                    <Model
                        hoveredPart={hoveredPart}
                        setHoveredPart={setHoveredPart}
                        onSelect={() => {}}
                        interactive={false}
                        position={[0, 0, 0]}
                        rotation={[0, 0, 0]}
                        scale={[modelScale, modelScale, modelScale]}
                    />
                </Suspense>
            </group>
        </group>
    );
};

const Details = () => {
    const sectionRef = useRef(null);
    const isMobile = useMediaQuery({ maxWidth: 480 });
    const isTablet = useMediaQuery({ maxWidth: 768 });
    const [isCanvasActive, setIsCanvasActive] = useState(false);
    const baseX = isTablet ? 0 : 0.45;
    const baseY = isMobile ? 1.16 : isTablet ? 1.18 : 0.42;
    const modelScale = isMobile ? 0.22 : isTablet ? 0.26 : 0.32;

    useEffect(() => {
        const node = sectionRef.current;
        if (!node || typeof IntersectionObserver === "undefined") {
            setIsCanvasActive(true);
            return undefined;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsCanvasActive(entry.isIntersecting);
            },
            { rootMargin: "80% 0px 80% 0px" }
        );

        observer.observe(node);
        return () => observer.disconnect();
    }, []);

    useGSAP(() => {
        const q = gsap.utils.selector(sectionRef);

        gsap.set(q(".feature-card"), { xPercent: -115 });
        gsap.set(q("#details-canvas"), {
            opacity: 0,
            scale: 1,
            x: 0,
            y: 0,
            clearProps: "transform",
            transformOrigin: "center center",
        });

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: sectionRef.current,
                start: "top top",
                end: "bottom bottom",
                scrub: 0.5,
                invalidateOnRefresh: true,
            },
        });

        tl.to(
            q("#details-canvas"),
            { opacity: 1, ease: "none", duration: 0.6 },
            0
        );
        tl.from(
            q(".scroll-indicator"),
            { opacity: 0, y: -24, ease: "power2.out", duration: 0.5 },
            0.15
        );
        // Pin-first: let the canvas finish fading in and give the user a beat
        // to take in the stationary stage before card 1 arrives.
        tl.to(
            q(".feature-card-1"),
            { xPercent: 0, ease: "power2.out", duration: 0.55 },
            0.85
        );

        for (let i = 1; i < features.length; i++) {
            const isLastFeature = i === features.length - 1;
            // Longer wait between cards — each card stays readable instead
            // of being shoved off-screen by the next one.
            const waitBeforeNextCard = isLastFeature ? "+=0.55" : "+=0.85";
            const transitionDuration = isLastFeature ? 0.35 : 0.5;

            tl.to(
                q(`.feature-card-${i}`),
                { xPercent: -115, ease: "power2.in", duration: transitionDuration },
                waitBeforeNextCard
            ).to(
                q(`.feature-card-${i + 1}`),
                { xPercent: 0, ease: "power2.out", duration: transitionDuration },
                "<+0.15"
            );
        }

        // Reserve part of the scrubbed timeline for the finished composition.
        // The CSS sticky stage then scrolls away naturally with card-4 + model
        // still in their final positions.
        tl.fromTo(
            q(".feature-card-4"),
            { opacity: 1 },
            { opacity: 1, ease: "none", duration: 2.1 }
        );

        requestAnimationFrame(() => ScrollTrigger.refresh());
    }, { scope: sectionRef, revertOnUpdate: true });

    return (
        <section className="details" id="details" ref={sectionRef}>
            <div className="details-stage">
                <div id="details-canvas">
                    {isCanvasActive && (
                        <Canvas
                            className="details-canvas-renderer"
                            frameloop="demand"
                            dpr={[0.75, 1]}
                            gl={{ powerPreference: "low-power", antialias: false }}
                            camera={{ position: [0, 0.5, 7], fov: 38 }}
                        >
                            <Environment background={false} preset="warehouse" resolution={64} />
                            <directionalLight position={[2, 2, 2]} intensity={1} />
                            <SpinningModel
                                baseX={baseX}
                                baseY={baseY}
                                modelScale={modelScale}
                            />
                        </Canvas>
                    )}
                </div>

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
