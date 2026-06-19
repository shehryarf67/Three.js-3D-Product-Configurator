import { Cards } from "./index.js";
// New hi-res balls (balls_hd 6-10 = lower-section set): 6=purple 10=white.
// Mockup shows two: a white bleeding off the top-right and a purple off the
// bottom-left. (Mint was removed.)
import ballPurple from "../assets/balls_hd/6.webp";
import ballWhite from "../assets/balls_hd/10.webp";

const ABOUT_BALLS = [
  { src: ballWhite, className: "about-ball about-ball--white" },
  { src: ballPurple, className: "about-ball about-ball--purple" },
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
