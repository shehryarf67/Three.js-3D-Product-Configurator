import camIntro from "../assets/Features_WebP/6.webp";
import camPhotos from "../assets/Features_WebP/4.webp";
import camOn from "../assets/Features_WebP/1.webp";
import camCloseup from "../assets/Features_WebP/2.webp";
import camSelfie from "../assets/Features_WebP/5.webp";
import selfieCallout from "../assets/Features_WebP/9.webp";
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
        callout: true,
    },
];

const Details = () => {
    const sectionRef = useRef(null);

    useGSAP(
        () => {
            const q = gsap.utils.selector(sectionRef);
            const sceneEls = q(".details-scene");

            // Starting state: the teal pipe waits off the right edge, the scroll
            // hint is hidden, and every scene is faded out (revealed on scrub).
            gsap.set(".details-pipe", { xPercent: 112 });
            gsap.set(".scroll-indicator", { autoAlpha: 0 });
            gsap.set(sceneEls, { autoAlpha: 0 });

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top top",
                    end: "bottom bottom",
                    scrub: 0.3,
                    invalidateOnRefresh: true,
                },
            });

            const revealScene = (i, pos) => {
                const scene = sceneEls[i];
                const copy = scene.querySelectorAll(".details-anim");
                const art = scene.querySelector(".details-scene-art");
                tl.to(scene, { autoAlpha: 1, duration: 0.35, ease: "none" }, pos);
                tl.fromTo(
                    art,
                    { autoAlpha: 0, yPercent: 7, scale: 0.93 },
                    { autoAlpha: 1, yPercent: 0, scale: 1, duration: 0.6, ease: "power2.out" },
                    pos
                );
                tl.fromTo(
                    copy,
                    { autoAlpha: 0, y: 40 },
                    { autoAlpha: 1, y: 0, duration: 0.5, ease: "power2.out", stagger: 0.08 },
                    pos + 0.1
                );
            };

            const hideScene = (i, pos) => {
                const scene = sceneEls[i];
                const copy = scene.querySelectorAll(".details-anim");
                const art = scene.querySelector(".details-scene-art");
                tl.to(copy, { autoAlpha: 0, y: -30, duration: 0.35, ease: "power2.in" }, pos);
                tl.to(
                    art,
                    { autoAlpha: 0, yPercent: -5, scale: 0.97, duration: 0.4, ease: "power2.in" },
                    pos
                );
                tl.to(scene, { autoAlpha: 0, duration: 0.35, ease: "none" }, pos + 0.05);
            };

            // 1. Pipe pops in from the right, scroll hint fades in.
            tl.to(".details-pipe", { xPercent: 0, duration: 0.9, ease: "power3.out" }, 0);
            tl.to(".scroll-indicator", { autoAlpha: 1, duration: 0.5, ease: "none" }, 0.3);

            // 2. First scene rides in just behind the pipe, then each subsequent
            //    scene crossfades after a readable dwell.
            revealScene(0, 0.45);
            let cursor = 0.45;
            for (let i = 1; i < scenes.length; i++) {
                cursor += 1.15; // dwell so each scene stays readable
                hideScene(i - 1, cursor);
                revealScene(i, cursor + 0.3);
                cursor += 0.45;
            }

            // Derive the pinned scroll distance from the real timeline length so
            // the sticky stage releases exactly as the last scene settles — no
            // trailing dead-scroll.
            //
            // XL-only fix: the distance is in vh, and on a tall extra-large
            // viewport a fixed vh count maps the same timeline onto far more
            // scroll. The fix isn't fewer vh (that races faster) — it's GRANTING
            // more scroll per scene on big screens so the brief intro and each
            // following scene get enough travel to read. Normal/laptop widths keep
            // the original 20 that was already working well.
            const vw = typeof window !== "undefined" ? window.innerWidth : 0;
            const SCROLL_PER_UNIT = vw >= 2200 ? 30 : vw >= 1600 ? 26 : 20;
            const distance = tl.duration() * SCROLL_PER_UNIT;
            const node = sectionRef.current;
            if (node) {
                node.style.minHeight = `${(100 + distance).toFixed(1)}vh`;
            }

            requestAnimationFrame(() => ScrollTrigger.refresh());
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
                                {scene.callout && (
                                    <img
                                        className="details-callout"
                                        src={selfieCallout}
                                        alt=""
                                        aria-hidden="true"
                                        loading="lazy"
                                        decoding="async"
                                    />
                                )}
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
