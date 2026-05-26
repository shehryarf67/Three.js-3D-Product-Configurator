import { Cards } from "./index.js";
import ballPurple from "../assets/balls/balls/3.webp";
import ballMint from "../assets/balls/balls/4.webp";
import ballWhite from "../assets/balls/balls/5.webp";

const ABOUT_BALLS = [
  { src: ballMint, className: "about-ball about-ball--mint" },
  { src: ballPurple, className: "about-ball about-ball--purple" },
  { src: ballWhite, className: "about-ball about-ball--white" },
];

const About = () => {
  return (
    <section className="about" id="about">
      {ABOUT_BALLS.map((ball) => (
        <img key={ball.className} className={ball.className} src={ball.src} alt="" aria-hidden="true" />
      ))}
      <div className="about-content">
        <Cards />
      </div>
    </section>
  );
};

export default About;
