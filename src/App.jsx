import { Navbar, Hero, About, Footer, CircleFloating, ModelCanvas, Details } from "./components";
import { useEffect } from "react";


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

    return () => observer.disconnect();
  }, []);


  return (
    <div className="app-shell">
      <Navbar />
      <Hero />
      <ModelCanvas />
      <Details />
      <About />
      <Footer />
    </div>
  );
}
