

const Footer = () => {
  return (
    <footer className="footer" id="contact">
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
          <div className="pills">
            <span className="pill">React</span>
            <span className="pill">Three.js</span>
            <span className="pill">GSAP</span>
            <span className="pill">Blender</span>
          </div>
        </div>
        <div className="footer_content_box2">
          <h3>NAVIGATE</h3>
          <a href="#home">Home</a>
          <a href="#about">About</a>
          <a href="#details">Details</a>
          <a href="#footer">Contact</a>
        </div>
        <div className="footer_content_box3">
          <h3>THE TEAM</h3>
          <h2>Shehryar Faisal</h2>
          <p>Frontend Developer & R3F <br />Developer</p>
          <a href="https://github.com/shehryarf67" target="_blank" rel="noopener noreferrer">
            github.com/shehryarf67
          </a>
          <a href="https://www.linkedin.com/in/shehryar-faisal-524b59309/" target="_blank" rel="noopener noreferrer">
            linkedin.com/in/shehryar-faisal
          </a>
          <h2>Hussain Asif</h2>
          <p>3D Artist & Blender</p>
          <a href="https://www.instagram.com/sibro___?igsh=aGpqMWh0dnNuNmVh" target="_blank" rel="noopener noreferrer">
            instagram.com/sibro___
          </a>
          <a href="https://sibro.artstation.com/projects?utm_source=ig&utm_medium=social&utm_content=link_in_bio&fbclid=PAb21jcARSuZ5leHRuA2FlbQIxMQBzcnRjBmFwcF9pZA81NjcwNjczNDMzNTI0MjcAAacKT8DRC2Sc8wnU6RRk41YUJoFe35aFh6GRtJ60c2w_JAE69ttNDkFTWFyRRQ_aem_6EGTxLZEdnJYHTMzjKJhrQ">
            artstation.com/sibro
          </a>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2026 InstaX-Fujifilm. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;