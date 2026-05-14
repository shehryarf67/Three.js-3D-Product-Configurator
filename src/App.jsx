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

    // Recalculate all ScrollTrigger positions after the full page has settled.
    // Sections above Showcase (Hero images, ModelCanvas GLTF) load async and
    // expand after the initial render, making cached trigger positions stale.
    const rafId = requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });

    return () => {
      observer.disconnect();
      cancelAnimationFrame(rafId);
    };
  }, []);


  return (
    <div className="app-shell">
      <Navbar />
      <Hero />
      <ModelCanvas />
      <Showcase />
      <Details />
      <About />
      <Footer />
    </div>
  );
}
