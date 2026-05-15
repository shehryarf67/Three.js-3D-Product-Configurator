import { Navbar, Hero, About, Footer, ModelCanvas, Details, Showcase } from "./components";
import { useEffect } from "react";
import { ScrollTrigger } from "./imports.js";


export default function App() {
  useEffect(() => {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("show");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0, rootMargin: "0px" });

    const elements = document.querySelectorAll(".reveal");
    elements.forEach((el) => observer.observe(el));
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
      observer.disconnect();
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
      <Details />
      <About />
      <Footer />
    </div>
  );
}
