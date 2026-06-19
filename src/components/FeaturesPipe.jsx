import { useRef } from "../imports.js";
import { gsap, ScrollTrigger, useGSAP } from "../imports.js";
import layer2nd from "../assets/features main/2ND LAYER - 1.webp";
import layerTop from "../assets/features main/TOP LAYER-2.webp";
import layer3rd from "../assets/features main/3RD LAYER - 3.webp";
// New hi-res balls (balls_hd 6-10 = lower-section set): 7=blue 8=pink 9=mint.
import ballBlue from "../assets/balls_hd/7.webp";
import ballPink from "../assets/balls_hd/8.webp";
import ballMint from "../assets/balls_hd/9.webp";

gsap.registerPlugin(ScrollTrigger);

const PIPE_BALLS = [
    { src: ballBlue, className: "pipe-ball pipe-ball--blue" },
    { src: ballPink, className: "pipe-ball pipe-ball--pink" },
    { src: ballMint, className: "pipe-ball pipe-ball--mint" },
];

const FeaturesPipe = () => {
    const sectionRef = useRef();

    useGSAP(() => {
        // Lock layers above the pipe before any animation fires
        gsap.set(".features-pipe", { x: "-110%" });
        gsap.set(".features-layer--2nd, .features-layer--top, .features-layer--3rd", { y: "-100%" });

        const tl = gsap.timeline({
            scrollTrigger: {
                // The pipe is a tall section you scroll THROUGH. Firing at
                // "top bottom" (the instant it peeked in from the bottom) meant
                // the whole reveal played before the user had scrolled to look at
                // it — they missed it. Fire later, once the section's top has
                // risen to 60% of the viewport, so the animation plays while it's
                // comfortably in view. Lower the % to trigger even later.
                trigger: sectionRef.current,
                start: "top 60%",
                toggleActions: "play none none none",
            },
        });

        // 1. Pipe background slides in from the left
        tl.to(".features-pipe", {
            x: "0%",
            duration: 0.85,
            ease: "power3.out",
        });

        // 2. Middle layer drops in first
        tl.to(".features-layer--2nd", {
            y: "0%",
            duration: 0.65,
            ease: "power2.out",
        }, "+=0.05");

        // 3. Top (front) layer drops in second
        tl.to(".features-layer--top", {
            y: "0%",
            duration: 0.65,
            ease: "power2.out",
        }, "-=0.35");

        // 4. Back layer drops in last
        tl.to(".features-layer--3rd", {
            y: "0%",
            duration: 0.65,
            ease: "power2.out",
        }, "-=0.35");

    }, { scope: sectionRef });

    return (
        <div className="features-pipe-section" id="features-pipe" ref={sectionRef}>
            <div className="features-pipe-frame">
                {PIPE_BALLS.map((ball) => (
                    <img key={ball.className} className={ball.className} src={ball.src} alt="" aria-hidden="true" loading="lazy" decoding="async" />
                ))}
                <div className="features-pipe">
                    <div
                        className="features-layer features-layer--3rd"
                        style={{ backgroundImage: `url(${layer3rd})` }}
                        aria-hidden="true"
                    />
                    <div
                        className="features-layer features-layer--2nd"
                        style={{ backgroundImage: `url(${layer2nd})` }}
                        aria-hidden="true"
                    />
                    <div
                        className="features-layer features-layer--top"
                        style={{ backgroundImage: `url(${layerTop})` }}
                        aria-hidden="true"
                    />
                    <div className="features-pipe__top-fill" aria-hidden="true" />
                    <div className="features-pipe__right-bulge" aria-hidden="true" />
                    <div className="features-pipe__bottom-fill" aria-hidden="true" />
                    <div className="features-pipe-heading-wrap">
                        <h2 className="features-pipe-heading">FEATURES</h2>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FeaturesPipe;
