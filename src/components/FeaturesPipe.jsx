import { useRef } from "../imports.js";
import { gsap, ScrollTrigger, useGSAP } from "../imports.js";
import layer2nd from "../assets/features main/2ND LAYER - 1.png";
import layerTop from "../assets/features main/TOP LAYER-2.png";
import layer3rd from "../assets/features main/3RD LAYER - 3.png";

gsap.registerPlugin(ScrollTrigger);

const FeaturesPipe = () => {
    const sectionRef = useRef();

    useGSAP(() => {
        // Lock layers above the pipe before any animation fires
        gsap.set(".features-pipe", { x: "-110%" });
        gsap.set(".features-layer--2nd, .features-layer--top, .features-layer--3rd", { y: "-100%" });

        const tl = gsap.timeline({
            scrollTrigger: {
                // Fire when the section pins (sticky child reaches viewport top).
                // At that moment the pipe is centered in the viewport — visible
                // and ready to be seen sliding in. Previous "top 75%" fired while
                // the pipe was still ~100vh below the fold.
                trigger: sectionRef.current,
                start: "top top",
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
        <div className="features-pipe-section" ref={sectionRef}>
            <div className="features-pipe-sticky">
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
                    <div className="features-pipe-heading-wrap">
                        <h2 className="features-pipe-heading">FEATURES</h2>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FeaturesPipe;
