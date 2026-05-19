import { gsap, ScrollTrigger, useGSAP, useMediaQuery } from "../imports.js";
import showcaseVideo from "../assets/INSTAX mini 12 Fill your world with joy_FUJIFILM - FUJIFILMglobal (1080p, h264).mp4";
import instaxLogo from "../assets/Logo.svg?raw";

const svgDataUrl = `data:image/svg+xml,${encodeURIComponent(instaxLogo)}`;

gsap.registerPlugin(ScrollTrigger);

const Showcase = () => {
    const isTablet = useMediaQuery({ query: "(max-width: 1024px)" });

    useGSAP(() => {
        if (isTablet) return;

        gsap.set("#showcase .text-video-mask", {
            maskSize: "200%",
            WebkitMaskSize: "200%",
        });

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: "#showcase",
                start: "top 4%",
                end: "+=800",
                scrub: 0.8,
                pin: true,
                pinSpacing: true,
                invalidateOnRefresh: true,
            },
        });

        tl.to(
            "#showcase .media-matte",
            { opacity: 1, ease: "none" },
            0
        )
            .fromTo(
                "#showcase .text-video-mask",
                {
                    opacity: 0,
                    maskSize: "200%",
                    WebkitMaskSize: "200%",
                },
                {
                    opacity: 1,
                    maskSize: "75%",
                    WebkitMaskSize: "75%",
                    ease: "power2.out",
                },
                0.08
            );
    }, [isTablet]);

    return (
        <section id="showcase">
            <div className="media">
                <video
                    className="base-video"
                    src={showcaseVideo}
                    autoPlay
                    loop
                    muted
                    playsInline
                />

                <div className="media-matte" />

                <div
                    className="text-video-mask"
                    style={{
                        WebkitMaskImage: `url("${svgDataUrl}")`,
                        maskImage: `url("${svgDataUrl}")`,
                    }}
                >
                    <video src={showcaseVideo} autoPlay loop muted playsInline />
                </div>
            </div>

        </section>
    );
};

export default Showcase;
