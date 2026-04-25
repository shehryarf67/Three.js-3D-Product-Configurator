import { useState } from "../imports.js";

import babyBlueFront from "../assets/baby_blue/baby_blue_1.png";
import babyBlueLeft from "../assets/baby_blue/baby_blue_2.png";
import babyBlueBack from "../assets/baby_blue/baby_blue_3.png";
import babyBlueRight from "../assets/baby_blue/baby_blue_4.png";

import blossomPinkFront from "../assets/blossom_pink/blossom_pink_1.png";
import blossomPinkLeft from "../assets/blossom_pink/blossom_pink_2.png";
import blossomPinkBack from "../assets/blossom_pink/blossom_pink_3.png";
import blossomPinkRight from "../assets/blossom_pink/blossom_pink_4.png";

import lilacPurpleFront from "../assets/lilac_purple/lilac_purple_1.png";
import lilacPurpleLeft from "../assets/lilac_purple/lilac_purple_2.png";
import lilacPurpleBack from "../assets/lilac_purple/lilac_purple_3.png";
import lilacPurpleRight from "../assets/lilac_purple/lilac_purple_4.png";

import mintGreenFront from "../assets/mint_green/mint_green_1.png";
import mintGreenLeft from "../assets/mint_green/mint_green_2.png";
import mintGreenBack from "../assets/mint_green/mint_green_3.png";
import mintGreenRight from "../assets/mint_green/mint_green_4.png";

const CAMERA_IMAGES = {
  "Baby Blue": { front: babyBlueFront, left: babyBlueLeft, back: babyBlueBack, right: babyBlueRight },
  "Blossom Pink": { front: blossomPinkFront, left: blossomPinkLeft, back: blossomPinkBack, right: blossomPinkRight },
  "Lilac Purple": { front: lilacPurpleFront, left: lilacPurpleLeft, back: lilacPurpleBack, right: lilacPurpleRight },
  "Mint Green": { front: mintGreenFront, left: mintGreenLeft, back: mintGreenBack, right: mintGreenRight },
};

const COLORS = Object.keys(CAMERA_IMAGES);

const Hero = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const next = () => setActiveIndex((prev) => (prev + 1) % COLORS.length);
  const prev = () => {
    setActiveIndex((prev) => (prev - 1 + COLORS.length) % COLORS.length);
  };

  const getPosition = (index) => {
    const offset = (index - activeIndex + COLORS.length) % COLORS.length;

    if (offset === 0) return "center";
    if (offset === 1) return "right";
    if (offset === 2) return "top";
    return "left";
  };

  const getImage = (color, position) => {
    if (position === "center") return CAMERA_IMAGES[color].front;
    if (position === "left") return CAMERA_IMAGES[color].left;
    if (position === "right") return CAMERA_IMAGES[color].right;
    return CAMERA_IMAGES[color].back;
  };

  return (
    <section className="hero" id="home">
      <div className="hero-content reveal">
        <h1 className="hero-title">
          Fill Your<br />World<br />With Joy
        </h1>
        <p className="hero-description">3D Camera Models</p>
      </div>

      <div className="hero-3d">
        <div className="hero-camera-stage">
          {COLORS.map((color, index) => {
            const position = getPosition(index);
            const image = getImage(color, position);

            return (
              <figure key={color} className={`hero-camera hero-camera--${position}`}>
                <img src={image} alt={color} />
              </figure>
            );
          })}
        </div>

        <div className="hero-camera-controls">
          <div className="hero-camera-pill">
            <button onClick={prev}>‹</button>
            <span>{COLORS[activeIndex].toUpperCase()}</span>
            <button onClick={next}>›</button>
          </div>
        </div>
      </div>
            <div className="hero-marquee">
        <div className="hero-marquee-track">
          <div className="hero-marquee-text">
            <span>Instax Mini 12</span>
            <span className="hero-marquee-separator">&bull;</span>
            <span>Fill Your World With Joy</span>
            <span className="hero-marquee-separator">&bull;</span>
            <span>Fujifilm</span>
            <span className="hero-marquee-separator">&bull;</span>
            <span>Instant Photography</span>
            <span className="hero-marquee-separator">&bull;</span>
          </div>

          <div className="hero-marquee-text">
            <span>Instax Mini 12</span>
            <span className="hero-marquee-separator">&bull;</span>
            <span>Fill Your World With Joy</span>
            <span className="hero-marquee-separator">&bull;</span>
            <span>Fujifilm</span>
            <span className="hero-marquee-separator">&bull;</span>
            <span>Instant Photography</span>
            <span className="hero-marquee-separator">&bull;</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;