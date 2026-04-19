

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
        © 2026 My Three.js Scene
      </div>
    </footer>
  );
};

export default Footer;