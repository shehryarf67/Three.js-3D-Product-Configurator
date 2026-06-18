import { useEffect, useRef, useState } from "../imports.js";

import camera1Front from "../assets/camera1/front.webp";
import camera1Rot1 from "../assets/camera1/rot_1.webp";
import camera1Rot2 from "../assets/camera1/rot_2.webp";
import camera1Rot3 from "../assets/camera1/rot_3.webp";
import camera1Rot4 from "../assets/camera1/rot_4.webp";

import camera2Front from "../assets/camera2/front.webp";
import camera2Rot1 from "../assets/camera2/rot_1.webp";
import camera2Rot2 from "../assets/camera2/rot_2.webp";
import camera2Rot3 from "../assets/camera2/rot_3.webp";
import camera2Rot4 from "../assets/camera2/rot_4.webp";

import camera3Front from "../assets/camera3/front.webp";
import camera3Rot1 from "../assets/camera3/rot_1.webp";
import camera3Rot2 from "../assets/camera3/rot_2.webp";
import camera3Rot3 from "../assets/camera3/rot_3.webp";
import camera3Rot4 from "../assets/camera3/rot_4.webp";

import camera4Front from "../assets/camera4/front.webp";
import camera4Rot1 from "../assets/camera4/rot_1.webp";
import camera4Rot2 from "../assets/camera4/rot_2.webp";
import camera4Rot3 from "../assets/camera4/rot_3.webp";
import camera4Rot4 from "../assets/camera4/rot_4.webp";

import camera5Front from "../assets/camera5/front.webp";
import camera5Rot1 from "../assets/camera5/rot_1.webp";
import camera5Rot2 from "../assets/camera5/rot_2.webp";
import camera5Rot3 from "../assets/camera5/rot_3.webp";
import camera5Rot4 from "../assets/camera5/rot_4.webp";

import ballBlue from "../assets/balls/balls/1.webp";
import ballPink from "../assets/balls/balls/2.webp";
import ballPurple from "../assets/balls/balls/3.webp";
import ballMint from "../assets/balls/balls/4.webp";
import ballWhite from "../assets/balls/balls/5.webp";

const CAMERA_IMAGES = {
  "Lilac Purple": { front: camera1Front, left: camera1Rot1, topLeft: camera1Rot2, topRight: camera1Rot3, right: camera1Rot4 },
  "Clay White": { front: camera2Front, left: camera2Rot1, topLeft: camera2Rot2, topRight: camera2Rot3, right: camera2Rot4 },
  "Mint Green": { front: camera3Front, left: camera3Rot1, topLeft: camera3Rot2, topRight: camera3Rot3, right: camera3Rot4 },
  "Blossom Pink": { front: camera4Front, left: camera4Rot1, topLeft: camera4Rot2, topRight: camera4Rot3, right: camera4Rot4 },
  "Baby Blue": { front: camera5Front, left: camera5Rot1, topLeft: camera5Rot2, topRight: camera5Rot3, right: camera5Rot4 },
};

const COLORS = Object.keys(CAMERA_IMAGES);
const CAMERA_FRAMES = Object.values(CAMERA_IMAGES).flatMap((camera) => Object.values(camera));
const ROTATION_DURATION = 950;
const CAMERA_FILTERS = {
  "Lilac Purple": "hue-rotate(18deg) saturate(1.28) brightness(1.02)",
  "Mint Green": "hue-rotate(-28deg) saturate(1.25) brightness(1.04)",
  "Baby Blue": "hue-rotate(-8deg) saturate(1.2) brightness(1.03)",
};
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
  // Smaller accent balls filling the empty corners/edges (desktop only — see
  // the CSS, which hides them ≤768px in favour of the compact mobile layout).
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

            return (
              <figure
                key={color}
                className={`hero-camera hero-camera--${position}`}
                aria-label={color}
                style={{ zIndex: getZIndex(position), "--camera-filter": CAMERA_FILTERS[color] ?? "none" }}
              >
                {Object.entries(CAMERA_IMAGES[color]).map(([imageKey, image]) => (
                  <span
                    key={imageKey}
                    className={`hero-camera-frame ${imageKey === activeImageKey ? "is-active" : ""}`}
                    aria-hidden={imageKey !== activeImageKey}
                  >
                    <img src={image} alt="" loading="eager" decoding="async" />
                  </span>
                ))}
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
