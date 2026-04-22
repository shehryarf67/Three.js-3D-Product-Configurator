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
                start: "top top",
                end: "+=1500",
                scrub: 1.5,
                pin: true,
                pinSpacing: true,
                anticipatePin: 1,
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
            )
            .to(
                "#showcase .content",
                { opacity: 1, y: 0, ease: "power1.out" },
                0.4
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

            <div className="content">
                <div className="content-inner">
                    <div className="content-copy">
                        <h2>INSTAX mini 12</h2>
                        <p className="lead">
                            Meet the instant camera designed to make everyday
                            moments feel playful, bright, and worth holding on
                            to.
                        </p>
                        <p>
                            INSTAX mini 12 brings quick, simple shooting into a
                            bold compact design, so capturing memories feels as
                            fun as sharing them. From spontaneous selfies to
                            weekend snapshots, it turns ordinary scenes into
                            prints you can keep, gift, and pin up anywhere.
                        </p>
                        <p>
                            With automatic exposure and flash control, the
                            camera helps each shot look balanced in different
                            lighting conditions without slowing down the
                            moment. Twist the lens to power on, switch into
                            close-up mode, and frame everything with the easy,
                            feel-good simplicity that makes instant photography
                            so addictive.
                        </p>
                        <a href="#details">Explore the INSTAX experience</a>
                    </div>

                    <div className="content-stats">
                        <div className="stat">
                            <span className="eyebrow">Up to</span>
                            <strong>90 sec</strong>
                            <p>for a print to develop into a shareable memory</p>
                        </div>

                        <div className="stat">
                            <span className="eyebrow">Built for</span>
                            <strong>Close-up mode</strong>
                            <p>selfies and detail shots with a simple lens twist</p>
                        </div>

                        <div className="stat">
                            <span className="eyebrow">Made easier with</span>
                            <strong>Automatic exposure</strong>
                            <p>for bright, balanced photos in everyday scenes</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Showcase;
