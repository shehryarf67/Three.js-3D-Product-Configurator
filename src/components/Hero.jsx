import { useEffect, useRef, useState } from "../imports.js";

import frontLilac from "../assets/HERO_WEBPS_1/A1.webp";
import frontWhite from "../assets/HERO_WEBPS_1/A2.webp";
import frontMint from "../assets/HERO_WEBPS_1/A3.webp";
import frontPink from "../assets/HERO_WEBPS_1/A4.webp";
import frontBlue from "../assets/HERO_WEBPS_1/A5.webp";

import rightWhite from "../assets/HERO_WEBPS_1/B1.webp";
import rightMint from "../assets/HERO_WEBPS_1/B2.webp";
import rightPink from "../assets/HERO_WEBPS_1/B3.webp";
import rightBlue from "../assets/HERO_WEBPS_1/B4.webp";
import rightLilac from "../assets/HERO_WEBPS_1/B5.webp";

import topRightMint from "../assets/HERO_WEBPS_1/C1.webp";
import topRightPink from "../assets/HERO_WEBPS_1/C2.webp";
import topRightBlue from "../assets/HERO_WEBPS_1/C3.webp";
import topRightLilac from "../assets/HERO_WEBPS_1/C4.webp";
import topRightWhite from "../assets/HERO_WEBPS_1/C5.webp";

import topLeftPink from "../assets/HERO_WEBPS_1/D1.webp";
import topLeftBlue from "../assets/HERO_WEBPS_1/D2.webp";
import topLeftLilac from "../assets/HERO_WEBPS_1/D3.webp";
import topLeftWhite from "../assets/HERO_WEBPS_1/D4.webp";
import topLeftMint from "../assets/HERO_WEBPS_1/D5.webp";

import leftBlue from "../assets/HERO_WEBPS_1/E1.webp";
import leftLilac from "../assets/HERO_WEBPS_1/E2.webp";
import leftWhite from "../assets/HERO_WEBPS_1/E3.webp";
import leftMint from "../assets/HERO_WEBPS_1/E4.webp";
import leftPink from "../assets/HERO_WEBPS_1/E5.webp";

import ballBlue from "../assets/balls/balls/1.webp";
import ballPink from "../assets/balls/balls/2.webp";
import ballPurple from "../assets/balls/balls/3.webp";
import ballMint from "../assets/balls/balls/4.webp";
import ballWhite from "../assets/balls/balls/5.webp";

const CAMERA_IMAGES = {
  "Lilac Purple": { front: frontLilac, left: leftLilac, topLeft: topLeftLilac, topRight: topRightLilac, right: rightLilac },
  "Clay White": { front: frontWhite, left: leftWhite, topLeft: topLeftWhite, topRight: topRightWhite, right: rightWhite },
  "Mint Green": { front: frontMint, left: leftMint, topLeft: topLeftMint, topRight: topRightMint, right: rightMint },
  "Blossom Pink": { front: frontPink, left: leftPink, topLeft: topLeftPink, topRight: topRightPink, right: rightPink },
  "Baby Blue": { front: frontBlue, left: leftBlue, topLeft: topLeftBlue, topRight: topRightBlue, right: rightBlue },
};

const COLORS = Object.keys(CAMERA_IMAGES);
const CAMERA_FRAMES = Object.values(CAMERA_IMAGES).flatMap((camera) => Object.values(camera));
// Must match the .hero-camera-img left/top/width transition in index.css so a
// second click can't fire mid-glide and cause a jump.
const ROTATION_DURATION = 850;
// HERO_WEBPS_1 already contains the real colour variants.
const CAMERA_FILTERS = {};
const POSITION_IMAGE_KEYS = {
  center: "front",
  left: "left",
  right: "right",
  "top-left": "topLeft",
  "top-right": "topRight",
};

const HERO_BALLS = [
  { src: ballBlue, className: "hero-ball hero-ball--blue" },
  { src: ballPink, className: "hero-ball hero-ball--pink" },
  { src: ballPurple, className: "hero-ball hero-ball--purple" },
  { src: ballMint, className: "hero-ball hero-ball--mint" },
  { src: ballWhite, className: "hero-ball hero-ball--white" },
  // Smaller accent balls filling the empty corners/edges on desktop.
  // The CSS hides them on tablet and below for the compact mobile layout.
  { src: ballMint, className: "hero-ball hero-ball--mint-2" },
  { src: ballWhite, className: "hero-ball hero-ball--white-2" },
  { src: ballPink, className: "hero-ball hero-ball--pink-2" },
  { src: ballPurple, className: "hero-ball hero-ball--purple-2" },
  { src: ballBlue, className: "hero-ball hero-ball--blue-2" },
];

const Hero = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const rotationTimeoutRef = useRef(null);
  const isRotatingRef = useRef(false);

  useEffect(() => {
    const preloadedImages = CAMERA_FRAMES.map((src) => {
      const image = new Image();
      image.decoding = "async";
      image.src = src;
      image.decode?.().catch(() => {});
      return image;
    });

    return () => {
      window.clearTimeout(rotationTimeoutRef.current);
      preloadedImages.length = 0;
    };
  }, []);

  const switchCamera = (getNext) => {
    if (isRotatingRef.current) return;

    isRotatingRef.current = true;
    setActiveIndex((prev) => getNext(prev));

    window.clearTimeout(rotationTimeoutRef.current);
    rotationTimeoutRef.current = window.setTimeout(() => {
      isRotatingRef.current = false;
    }, ROTATION_DURATION);
  };

  const next = () => switchCamera((prev) => (prev + 1) % COLORS.length);
  const prev = () => switchCamera((prev) => (prev - 1 + COLORS.length) % COLORS.length);

  const getPosition = (index) => {
    const offset = (index - activeIndex + COLORS.length) % COLORS.length;

    if (offset === 0) return "center";
    if (offset === 1) return "right";
    if (offset === 2) return "top-right";
    if (offset === 3) return "top-left";
    return "left";
  };

  const getZIndex = (position) => {
    if (position === "center") return 4;
    if (position === "right") return 3;
    if (position === "left") return 2;
    return 1;
  };

  return (
    <section className="hero" id="home">
      {HERO_BALLS.map((ball) => (
        <img key={ball.className} className={ball.className} src={ball.src} alt="" aria-hidden="true" />
      ))}
      <div className="hero-content reveal">
        <h1 className="hero-title">
          Fill Your<br />World<br />With Joy
        </h1>
        <p className="hero-description">Instax Mini 12</p>
      </div>

      <div className="hero-3d">
        <div className="hero-camera-stage">
          {COLORS.map((color, index) => {
            const position = getPosition(index);
            const activeImageKey = POSITION_IMAGE_KEYS[position];
            const image = CAMERA_IMAGES[color][activeImageKey];

            return (
              <figure
                key={color}
                className={`hero-camera hero-camera--${position}`}
                aria-label={color}
                style={{
                  zIndex: getZIndex(position),
                  "--camera-filter": CAMERA_FILTERS[color] ?? "none",
                }}
              >
                <img
                  className="hero-camera-img"
                  src={image}
                  alt=""
                  loading={position === "center" ? "eager" : "lazy"}
                  decoding="async"
                  fetchPriority={position === "center" ? "high" : "auto"}
                />
              </figure>
            );
          })}
        </div>

        <div className="hero-camera-controls">
          <div className="hero-camera-pill">
            <button type="button" onClick={prev} aria-label="Previous camera color">{"<"}</button>
            <span>{COLORS[activeIndex].toUpperCase()}</span>
            <button type="button" onClick={next} aria-label="Next camera color">{">"}</button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
