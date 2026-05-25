import { gsap, ScrollTrigger, useEffect, useGSAP, useMediaQuery, useRef, useState } from "../imports.js";
import showcaseVideo from "../assets/INSTAX mini 12 Fill your world with joy_FUJIFILM - FUJIFILMglobal (1080p, h264).mp4";
import instaxLogo from "../assets/Logo.svg?raw";

const svgDataUrl = `data:image/svg+xml,${encodeURIComponent(instaxLogo)}`;
const VIDEO_READY_TIMEOUT = 3000;

gsap.registerPlugin(ScrollTrigger);

const Showcase = () => {
    const sectionRef = useRef(null);
    const baseVideoRef = useRef(null);
    const maskedVideoRef = useRef(null);
    const [mediaReady, setMediaReady] = useState(false);
    const isCompact = useMediaQuery({ query: "(max-width: 1024px)" });
    const isPhone = useMediaQuery({ query: "(max-width: 768px)" });

    useEffect(() => {
        setMediaReady(false);

        const videos = [baseVideoRef.current, maskedVideoRef.current].filter(Boolean);
        if (!videos.length) return;

        const isReady = (video) => video.readyState >= 2;
        let rafId;

        const refreshAfterPaint = () => {
            cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(() => ScrollTrigger.refresh());
        };

        const markReadyIfSettled = () => {
            if (videos.every(isReady)) {
                setMediaReady(true);
                refreshAfterPaint();
            }
        };

        const handleVideoError = () => {
            setMediaReady(true);
            refreshAfterPaint();
        };

        videos.forEach((video) => {
            video.addEventListener("loadeddata", markReadyIfSettled);
            video.addEventListener("canplay", markReadyIfSettled);
            video.addEventListener("error", handleVideoError);
        });

        markReadyIfSettled();

        const timeoutId = window.setTimeout(() => {
            setMediaReady(true);
            refreshAfterPaint();
        }, VIDEO_READY_TIMEOUT);

        return () => {
            window.clearTimeout(timeoutId);
            cancelAnimationFrame(rafId);
            videos.forEach((video) => {
                video.removeEventListener("loadeddata", markReadyIfSettled);
                video.removeEventListener("canplay", markReadyIfSettled);
                video.removeEventListener("error", handleVideoError);
            });
        };
    }, [isCompact, isPhone]);

    useGSAP(() => {
        if (!mediaReady) return;

        const q = gsap.utils.selector(sectionRef);
        const targetMaskSize = isPhone ? "92%" : isCompact ? "85%" : "75%";
        const scrollDistance = isPhone ? 520 : isCompact ? 650 : 800;

        gsap.set(q(".text-video-mask"), {
            maskSize: "200%",
            WebkitMaskSize: "200%",
        });

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: sectionRef.current,
                start: isCompact ? "top top" : "top 4%",
                end: () => `+=${scrollDistance}`,
                scrub: isPhone ? 0.35 : 0.5,
                pin: true,
                pinSpacing: true,
                fastScrollEnd: true,
                invalidateOnRefresh: true,
            },
        });

        tl.to(
            q(".media-matte"),
            { opacity: 1, ease: "none" },
            0
        )
            .fromTo(
                q(".text-video-mask"),
                {
                    opacity: 0,
                    maskSize: "200%",
                    WebkitMaskSize: "200%",
                },
                {
                    opacity: 1,
                    maskSize: targetMaskSize,
                    WebkitMaskSize: targetMaskSize,
                    ease: "power2.out",
                },
                0.08
            );

        requestAnimationFrame(() => ScrollTrigger.refresh());
    }, { scope: sectionRef, dependencies: [isCompact, isPhone, mediaReady], revertOnUpdate: true });

    return (
        <section id="showcase" ref={sectionRef}>
            <div className="media">
                <video
                    ref={baseVideoRef}
                    className="base-video"
                    src={showcaseVideo}
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="auto"
                />

                <div className="media-matte" />

                <div
                    className="text-video-mask"
                    style={{
                        WebkitMaskImage: `url("${svgDataUrl}")`,
                        maskImage: `url("${svgDataUrl}")`,
                    }}
                >
                    <video
                        ref={maskedVideoRef}
                        src={showcaseVideo}
                        autoPlay
                        loop
                        muted
                        playsInline
                        preload="auto"
                    />
                </div>
            </div>

        </section>
    );
};

export default Showcase;
