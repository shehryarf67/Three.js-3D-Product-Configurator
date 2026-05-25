import { Navbar, Hero, About, Footer, ModelCanvas, Details, Showcase, FeaturesPipe } from "./components";
import { useEffect } from "react";
import { ScrollTrigger } from "./imports.js";


export default function App() {
  useEffect(() => {
    const revealCallback = (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("show");
          obs.unobserve(entry.target);
        }
      });
    };

    // .reveal: small early trigger so cards/text appear as the user scrolls
    // toward them — feels responsive.
    const revealObserver = new IntersectionObserver(revealCallback, {
      threshold: 0,
      rootMargin: "0px 0px 100px 0px",
    });
    document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

    // .reveal-scale: the ModelCanvas pink panel. Hold the animation until the
    // panel is meaningfully in the viewport — the scale-in shouldn't play
    // while the section is still below the fold.
    const revealScaleObserver = new IntersectionObserver(revealCallback, {
      threshold: 0,
      rootMargin: "0px 0px -150px 0px",
    });
    document.querySelectorAll(".reveal-scale").forEach((el) => revealScaleObserver.observe(el));
    const heroBg = document.querySelector(".hero-bg");
    let rafId;
    const sizeObserver = heroBg
      ? new ResizeObserver(() => {
          cancelAnimationFrame(rafId);
          rafId = requestAnimationFrame(() => ScrollTrigger.refresh());
        })
      : null;
    if (sizeObserver) sizeObserver.observe(heroBg);

    const initialRafId = requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      revealObserver.disconnect();
      revealScaleObserver.disconnect();
      sizeObserver?.disconnect();
      cancelAnimationFrame(rafId);
      cancelAnimationFrame(initialRafId);
    };
  }, []);


  return (
    <div className="app-shell">
      <Navbar />
      <div className="hero-bg">
        <Hero />
      </div>
      <ModelCanvas />
      <Showcase />
      <FeaturesPipe />
      <Details />
      <About />
      <Footer />
    </div>
  );
}
