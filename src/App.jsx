import { Navbar, Hero, About, Footer, CircleFloating } from "./components";
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
    <div style={{ width: "100vw", height: "100vh" }}>
      <Navbar />
      {/* <CircleFloating /> */}
      <Hero />
      <About />
      <Footer />
    </div>
  );
}