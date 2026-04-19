

const Footer = () => {
  return (
    <footer className="footer">
      <div className="waves-container">
        <svg
          className="waves"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 150 40"
          preserveAspectRatio="none"
        >
          <defs>
            <path
              id="wave-path"
              d="M-160 20c30 0 58-18 88-18s58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z"
            />
          </defs>

          <g className="parallax">
            <use href="#wave-path" x="48" y="0" fill="rgba(255,255,255,0.7)" />
            <use href="#wave-path" x="48" y="1" fill="rgba(255,255,255,0.5)" />
            <use href="#wave-path" x="48" y="3" fill="rgba(255,255,255,0.3)" />
            <use href="#wave-path" x="48" y="5" fill="#fff" />
          </g>
        </svg>
      </div>

      <div className="footer-content">
        <div className="footer_content_box1">
          <h2>InstaX-Fujifilm</h2>
          <p>Crafted with React, Three.js & passion.
            <br />
            A 3D Camera Showcase Experience.
          </p>
        </div>
        <div className="footer_content_box2">
          <h3>NAVIGATE</h3>
          <a href="#home">Home</a>
          <a href="#about">About</a>
          <a href="#details">Details</a>
          <a href="#footer">Contact</a>
        </div>
        <div className="footer_content_box3">
          <h2>The Team</h2>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
            Twitter
          </a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
            Instagram
          </a>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
            LinkedIn
          </a>
        </div>
      </div>
      © 2026 My Three.js Scene
    </footer>
  );
};

export default Footer;