import { useEffect, useRef, useState } from "../imports.js";

import camera1Front from "../assets/camera1/front.png";
import camera1Rot1 from "../assets/camera1/rot_1.png";
import camera1Rot2 from "../assets/camera1/rot_2.png";
import camera1Rot3 from "../assets/camera1/rot_3.png";
import camera1Rot4 from "../assets/camera1/rot_4.png";

import camera2Front from "../assets/camera2/front.png";
import camera2Rot1 from "../assets/camera2/rot_1.png";
import camera2Rot2 from "../assets/camera2/rot_2.png";
import camera2Rot3 from "../assets/camera2/rot_3.png";
import camera2Rot4 from "../assets/camera2/rot_4.png";

import camera3Front from "../assets/camera3/front.png";
import camera3Rot1 from "../assets/camera3/rot_1.png";
import camera3Rot2 from "../assets/camera3/rot_2.png";
import camera3Rot3 from "../assets/camera3/rot_3.png";
import camera3Rot4 from "../assets/camera3/rot_4.png";

import camera4Front from "../assets/camera4/front.png";
import camera4Rot1 from "../assets/camera4/rot_1.png";
import camera4Rot2 from "../assets/camera4/rot_2.png";
import camera4Rot3 from "../assets/camera4/rot_3.png";
import camera4Rot4 from "../assets/camera4/rot_4.png";

import camera5Front from "../assets/camera5/front.png";
import camera5Rot1 from "../assets/camera5/rot_1.png";
import camera5Rot2 from "../assets/camera5/rot_2.png";
import camera5Rot3 from "../assets/camera5/rot_3.png";
import camera5Rot4 from "../assets/camera5/rot_4.png";

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
const POSITION_IMAGE_KEYS = {
  center: "front",
  left: "left",
  right: "right",
  "top-left": "topLeft",
  "top-right": "topRight",
};

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
            const activeImageKey = POSITION_IMAGE_KEYS[position];

            return (
              <figure
                key={color}
                className={`hero-camera hero-camera--${position}`}
                aria-label={color}
                style={{ zIndex: getZIndex(position) }}
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
