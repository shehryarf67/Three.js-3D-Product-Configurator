import { Navbar, Hero, About, Footer, CircleFloating } from "./components";
import { useEffect } from "react";

export default function App() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("show"); 
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0,
        rootMargin: "0px",
      }
    );

    const timeout = setTimeout(() => {
      document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    }, 100);

    return () => {
      clearTimeout(timeout);
      observer.disconnect();
    };
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