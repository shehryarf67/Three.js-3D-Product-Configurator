import { Navbar, Hero, About, Footer, CircleFloating } from "./components";

export default function App() {
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Navbar />
      <CircleFloating />
      <Hero />
      <About />
      <Footer />
    </div>
  );
}