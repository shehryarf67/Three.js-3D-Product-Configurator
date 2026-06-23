import camIntro from "../assets/Features_WebP/6.webp";
import camPhotos from "../assets/Features_WebP/4.webp";
import camOn from "../assets/Features_WebP/1.webp";
import camCloseup from "../assets/Features_WebP/2.webp";
import camSelfie from "../assets/Features_WebP/selfie-combined.webp";
import polaroidOff from "../assets/Features_WebP/7.webp";
import polaroidOn from "../assets/Features_WebP/8.webp";
import ballsCluster from "../assets/Features_WebP/3.webp";
import {
    gsap,
    ScrollTrigger,
    useGSAP,
    useRef,
    clsx,
} from "../imports.js";

gsap.registerPlugin(ScrollTrigger);

// Each entry is one scroll-step ("scene"). The left copy column and the right
// webp composition crossfade as the pinned stage is scrubbed through.
const scenes = [
    {
        key: "intro",
        title: "INSTAX MINI 12",
        description:
            "Experience the thrill of capturing every moment with cutting-edge technology.",
        image: camIntro,
        artClass: "details-art--intro",
    },
    {
        key: "bright",
        number: "01",
        title: "Take bright photos, no matter where or when!",
        description:
            "Shutter speed, flash brightness and other settings automatically adjust to ambient light, so you can take the photos with ease.",
        image: camPhotos,
        artClass: "details-art--photos",
    },
    {
        key: "closeup-on",
        number: "02",
        title: "Easy to use for the perfect close-up!",
        description: "Twist the lens to turn on.",
        image: camOn,
        artClass: "details-art--on",
        balls: true,
        demo: [{ src: polaroidOff, on: false }],
    },
    {
        key: "closeup-mode",
        number: "03",
        title: "Easy to use for the perfect close-up!",
        description:
            "Twist again for Close-up mode, simple! This mode is ideal for distances of 30 to 50 cm.",
        image: camCloseup,
        artClass: "details-art--closeup",
        balls: true,
        demo: [
            { src: polaroidOff, on: false },
            { src: polaroidOn, on: true },
        ],
    },
    {
        key: "selfie",
        number: "04",
        title: "Take better selfies than ever before!",
        description:
            "Use the selfie mirror to line up your shot. Flash adjusts automatically, even in Close-up mode! Get just the right amount of light without overexposing the photo.",
        image: camSelfie,
        artClass: "details-art--selfie",
    },
];

const DETAILS_SCROLL_DISTANCE = {
    desktop: 3800,
    tablet: 3300,
    phone: 2900,
};

// Timeline knobs. These are timeline units, mapped across the scroll distances
// above. Increase PIN_BLANK to keep the pinned screen empty longer.
const PIN_BLANK = 0.5;
const PIPE_REVEAL_DURATION = 0.85;
const FIRST_SCENE_OVERLAP = 0.2;
const SCENE_IN_DURATION = 0.55;
const SCENE_DWELL = 1.05;
const SCENE_OUT_DURATION = 0.38;
const SCENE_GAP = 0.16;
const FINAL_DWELL = 0.85;
const RELEASE_OUT_DURATION = 0.65;

const getDetailsScrollDistance = () => {
    if (typeof window === "undefined") return DETAILS_SCROLL_DISTANCE.desktop;
    if (window.innerWidth <= 480) return DETAILS_SCROLL_DISTANCE.phone;
    if (window.innerWidth <= 768) return DETAILS_SCROLL_DISTANCE.tablet;
    return DETAILS_SCROLL_DISTANCE.desktop;
};

const Details = () => {
    const sectionRef = useRef(null);

    useGSAP(
        () => {
            const q = gsap.utils.selector(sectionRef);
            const stage = q(".details-stage")[0];
            const sceneEls = q(".details-scene");
            const pipe = q(".details-pipe");
            const scrollIndicator = q(".scroll-indicator");
            const node = sectionRef.current;
            const allCopy = q(".details-anim");
            const allArt = q(".details-scene-art");

            node?.style.removeProperty("min-height");

            if (!stage || !node || sceneEls.length === 0) return;

            const mm = gsap.matchMedia();

            // One pinned, scrubbed cinematic timeline for ALL widths. On phones the
            // ≤768 CSS re-stacks each scene into a full-screen panel (copy on top,
            // camera anchored to the bottom band over the teal pipe) so the same
            // crossfade reads as an immersive per-feature panel instead of the
            // desktop two-column layout.
            mm.add("(min-width: 1px)", () => {
                gsap.set(pipe, { autoAlpha: 1, xPercent: 112 });
                gsap.set(scrollIndicator, { autoAlpha: 0 });
                gsap.set(sceneEls, { autoAlpha: 0 });
                gsap.set(allCopy, { autoAlpha: 0, y: 36 });
                gsap.set(allArt, { autoAlpha: 0, yPercent: 7, scale: 0.94 });

                const tl = gsap.timeline({
                    scrollTrigger: {
                        trigger: node,
                        start: "top top",
                        end: () => `+=${getDetailsScrollDistance()}`,
                        scrub: 0.35,
                        pin: stage,
                        pinSpacing: true,
                        anticipatePin: 1,
                        fastScrollEnd: true,
                        invalidateOnRefresh: true,
                    },
                });

                const revealScene = (i, pos) => {
                    const scene = sceneEls[i];
                    const copy = scene.querySelectorAll(".details-anim");
                    const art = scene.querySelector(".details-scene-art");
                    tl.set(scene, { autoAlpha: 1 }, pos);
                    tl.to(
                        art,
                        { autoAlpha: 1, yPercent: 0, scale: 1, duration: SCENE_IN_DURATION, ease: "power2.out" },
                        pos
                    );
                    tl.to(
                        copy,
                        { autoAlpha: 1, y: 0, duration: SCENE_IN_DURATION, ease: "power2.out", stagger: 0.08 },
                        pos + 0.08
                    );
                };

                const hideScene = (i, pos) => {
                    const scene = sceneEls[i];
                    const copy = scene.querySelectorAll(".details-anim");
                    const art = scene.querySelector(".details-scene-art");
                    tl.to(copy, { autoAlpha: 0, y: -26, duration: SCENE_OUT_DURATION, ease: "power2.in" }, pos);
                    tl.to(
                        art,
                        { autoAlpha: 0, yPercent: -5, scale: 0.97, duration: SCENE_OUT_DURATION, ease: "power2.in" },
                        pos
                    );
                    tl.set(scene, { autoAlpha: 0 }, pos + SCENE_OUT_DURATION);
                };

                const PIPE_IN_AT = PIN_BLANK;
                const FIRST_SCENE_AT = PIPE_IN_AT + PIPE_REVEAL_DURATION - FIRST_SCENE_OVERLAP;

                tl.to({}, { duration: PIN_BLANK }, 0);
                tl.to(pipe, { xPercent: 0, duration: PIPE_REVEAL_DURATION, ease: "power3.out" }, PIPE_IN_AT);
                tl.to(scrollIndicator, { autoAlpha: 1, duration: 0.5, ease: "none" }, PIPE_IN_AT + 0.35);

                revealScene(0, FIRST_SCENE_AT);
                let cursor = FIRST_SCENE_AT;
                for (let i = 1; i < scenes.length; i++) {
                    cursor += SCENE_IN_DURATION + SCENE_DWELL;
                    hideScene(i - 1, cursor);
                    cursor += SCENE_OUT_DURATION + SCENE_GAP;
                    revealScene(i, cursor);
                }

                cursor += SCENE_IN_DURATION + FINAL_DWELL;
                hideScene(scenes.length - 1, cursor);
                tl.to(scrollIndicator, { autoAlpha: 0, duration: RELEASE_OUT_DURATION, ease: "none" }, cursor);
                tl.to(
                    pipe,
                    { autoAlpha: 0, xPercent: 24, duration: RELEASE_OUT_DURATION, ease: "power2.in" },
                    cursor
                );
                tl.to({}, { duration: 0.15 });

                requestAnimationFrame(() => ScrollTrigger.refresh());
            });
        },
        { scope: sectionRef, revertOnUpdate: true }
    );

    return (
        <section className="details" id="details" ref={sectionRef}>
            <div className="details-stage">
                <div className="details-pipe" aria-hidden="true" />

                <div className="details-scenes">
                    {scenes.map((scene) => (
                        <div
                            key={scene.key}
                            className={clsx("details-scene", `details-scene--${scene.key}`)}
                        >
                            <div className="details-scene-copy">
                                {scene.number && (
                                    <span className="details-number details-anim">{scene.number}</span>
                                )}
                                <h3 className="details-scene-title details-anim">{scene.title}</h3>
                                <p className="details-scene-description details-anim">
                                    {scene.description}
                                </p>
                                {scene.demo && (
                                    <div className="details-demo details-anim">
                                        {scene.demo.map((demo) => (
                                            <figure
                                                key={demo.on ? "on" : "off"}
                                                className="details-demo-item"
                                            >
                                                <img
                                                    className="details-demo-img"
                                                    src={demo.src}
                                                    alt=""
                                                    loading="lazy"
                                                    decoding="async"
                                                />
                                                <figcaption
                                                    className={clsx(
                                                        "details-pill",
                                                        demo.on ? "details-pill--on" : "details-pill--off"
                                                    )}
                                                >
                                                    <span className="details-pill-label">CLOSE UP</span>
                                                    <span className="details-pill-state">
                                                        {demo.on ? "ON" : "OFF"}
                                                    </span>
                                                </figcaption>
                                            </figure>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className={clsx("details-scene-art", scene.artClass)}>
                                <img
                                    className="details-cam"
                                    src={scene.image}
                                    alt=""
                                    aria-hidden="true"
                                    loading="lazy"
                                    decoding="async"
                                />
                                {scene.balls && (
                                    <img
                                        className="details-art-balls"
                                        src={ballsCluster}
                                        alt=""
                                        aria-hidden="true"
                                        loading="lazy"
                                        decoding="async"
                                    />
                                )}
                                {/* Selfie scene: the pointer/callout is baked into
                                    selfie-combined.webp (the camera image), so no
                                    separate overlay element is needed. */}
                            </div>
                        </div>
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
