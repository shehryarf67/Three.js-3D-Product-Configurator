<div align="center">

# Instax Mini 12 3D Product Configurator

An interactive product experience built with React, Three.js, React Three Fiber, and GSAP.

Explore the Fujifilm Instax Mini 12 through a responsive 3D viewer, real-time colour customisation, animated product storytelling, interactive specifications, and a client-side Polaroid selfie experience.

[View Live Demo](https://instaxfujifilm.vercel.app/)

<br />

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react\&logoColor=white)
![Three.js](https://img.shields.io/badge/Three.js-0.182-000000?logo=threedotjs\&logoColor=white)
![React Three Fiber](https://img.shields.io/badge/React_Three_Fiber-9-EF4A3C)
![GSAP](https://img.shields.io/badge/GSAP-3-88CE02?logo=greensock\&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite\&logoColor=white)
![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000000?logo=vercel\&logoColor=white)

</div>

---

## Preview

<div align="center">
  <img
    src="https://github.com/user-attachments/assets/2d5373dc-f914-4367-9f87-872a0d222ed6"
    alt="Instax Mini 12 interactive website preview"
    width="100%"
  />
</div>

<br />

<div align="center">
  <img
    src="https://github.com/user-attachments/assets/2a833cee-9895-4ed1-9d4e-d8bca1e4d676"
    alt="Interactive Instax camera viewer"
    width="48%"
  />
  <img
    src="https://github.com/user-attachments/assets/662256ac-72db-469e-836d-1acc614a2704"
    alt="Instax product storytelling section"
    width="48%"
  />
</div>

---

## About the Project

This was a self-directed project created to explore how modern frontend development can be combined with real-time 3D graphics.

The experience is inspired by the Fujifilm Instax Mini 12 and presents the product through a mix of interactive WebGL content, scroll-driven animation, responsive interface design, and product-focused storytelling.

The project was developed over four months while learning React, Three.js, and React Three Fiber through practical implementation.

---

## Features

### Interactive 3D Product Viewer

* Drag or scroll to rotate the camera
* Touch-friendly interaction for mobile and tablet devices
* Responsive camera positioning across different screen sizes
* Smooth model movement and controlled render updates
* Custom environment lighting and product shadows

### Real-Time Colour Customisation

Switch between five Instax-inspired colour variants:

* Lilac Purple
* Clay White
* Mint Green
* Blossom Pink
* Baby Blue

### Interactive Product Components

Hover or tap different parts of the camera to reveal their specifications and animations, including:

* Camera body
* Lens
* Camera base
* Battery cover
* Flash
* Shutter button
* Polaroid print

### Selfie-to-Polaroid Experience

* Use your device camera to take a selfie
* Apply a custom Instax-inspired film grade
* Print the photo through the 3D camera
* Watch the Polaroid eject and develop
* Rotate the finished Polaroid
* Retake or download the image locally
* Use a built-in default image when camera access is unavailable

All photo processing takes place inside the browser. Captured images are not uploaded to a server or stored remotely.

### Animated Product Storytelling

* GSAP and ScrollTrigger-powered animations
* Pinned product feature sequences
* Scroll-controlled scene transitions
* Layered feature reveal animations
* Video displayed through a custom Instax logo mask
* Responsive animation behaviour for desktop, tablet, and mobile

### Responsive Design

The interface adapts across:

* Desktop monitors
* Laptops
* Tablets
* Mobile phones
* Touch and pointer-based devices

---

## Technology Stack

| Area             | Technologies                                       |
| ---------------- | -------------------------------------------------- |
| Frontend         | React 19, JavaScript, HTML5, CSS3                  |
| 3D               | Three.js, React Three Fiber, Drei                  |
| Animation        | GSAP, ScrollTrigger, `@gsap/react`                 |
| 3D interaction   | R3F pointer events, custom drag and wheel controls |
| Image processing | Canvas API, MediaDevices API                       |
| Build tooling    | Vite                                               |
| Deployment       | Vercel                                             |
| Assets           | GLB models, WebP images, SVG masks, MP4 video      |

---

## Performance Optimisations

Several techniques are used to keep the 3D and animation-heavy experience responsive:

* Demand-based React Three Fiber rendering
* Restricted device pixel ratio
* Compressed GLB assets
* WebP image assets
* Image preloading for carousel transitions
* Lazy loading and asynchronous image decoding
* Suspense-based model loading state
* Video playback paused when off-screen
* Video playback paused when the browser tab is hidden
* Reduced unnecessary frame updates
* Separate interaction behaviour for touch and pointer devices

---

## Project Structure

```text
Three.js-3D-Product-Configurator/
├── public/
│   └── models/
├── scripts/
│   └── render-instax.mjs
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── About.jsx
│   │   ├── CameraCapture.jsx
│   │   ├── Cards.jsx
│   │   ├── Details.jsx
│   │   ├── FeaturesPipe.jsx
│   │   ├── Footer.jsx
│   │   ├── Hero.jsx
│   │   ├── Instax12.jsx
│   │   ├── InstaxLogo.jsx
│   │   ├── ModelCanvas.jsx
│   │   ├── Navbar.jsx
│   │   └── Showcase.jsx
│   ├── App.jsx
│   ├── imports.js
│   ├── index.css
│   └── main.jsx
├── index.html
├── package.json
└── vite.config.js
```

---

## Getting Started

### Prerequisites

Install a recent LTS version of Node.js and npm.

### Installation

Clone the repository:

```bash
git clone https://github.com/shehryarf67/Three.js-3D-Product-Configurator.git
```

Enter the project directory:

```bash
cd Three.js-3D-Product-Configurator
```

Install the dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the local URL displayed by Vite in your browser.

---

## Available Scripts

| Command                 | Description                          |
| ----------------------- | ------------------------------------ |
| `npm run dev`           | Start the Vite development server    |
| `npm run build`         | Create a production build            |
| `npm run preview`       | Preview the production build locally |
| `npm run lint`          | Run ESLint                           |
| `npm run render:instax` | Run the Instax rendering script      |

---

## Webcam Privacy

The selfie feature uses the browser's MediaDevices API.

* Camera access is requested only after user interaction
* Images are processed locally in the browser
* Captured photos are not sent to a server
* Photos are not stored by the application
* Downloads are generated directly on the user's device

Users may also choose the built-in default photo without granting camera permission.

---

## What I Learned

This project provided hands-on experience with:

* Building interactive 3D scenes in React
* Managing 3D state and DOM state together
* Creating drag, scroll, hover, and touch interactions
* Working with GLB models and materials
* Designing scroll-driven animation timelines
* Processing webcam images through the Canvas API
* Optimising 3D models, images, and videos for the web
* Building responsive layouts for a visually complex interface
* Debugging browser, device, and performance differences
* Deploying a production React application

---

## Credits

### Development

**Shehryar Faisal**

* [Live Project](https://instaxfujifilm.vercel.app/)
* [GitHub Profile](https://github.com/shehryarf67)

### 3D Model and Design Contribution

**Hussain Asif**

Hussain created the custom 3D camera model and contributed significantly to the website's visual design.

* [ArtStation](https://sibro.artstation.com/projects)

---

## Disclaimer

This is an independent educational and portfolio project.

It is not affiliated with, endorsed by, or sponsored by Fujifilm. Fujifilm, Instax, Instax Mini 12, and their associated names, logos, and product imagery are trademarks or intellectual property of their respective owners.

---

## License

This repository currently does not include an open-source license.

Unless a license is added, the source code and original project assets may not be copied, modified, or redistributed without permission.
