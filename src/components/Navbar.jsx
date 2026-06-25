import React, { useState } from "react";
import InstaxLogo from "./InstaxLogo";

const NAV_ITEMS = [
  { label: "Home", id: "home" },
  { label: "Model", id: "model-canvas" },
  { label: "Showcase", id: "showcase" },
  { label: "Details", id: "details" },
  { label: "About", id: "about" },
  { label: "Contact", id: "contact" },
];

const Navbar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleNavClick = (id, e) => {
    setSidebarOpen(false);
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSidebarToggle = () => {
    setSidebarOpen(prev => !prev);
  };

  return (
    <>
      {/* Dimmer overlay — renders behind the sidebar but above page content */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 998,
            background: 'rgba(0,0,0,0.4)',
            backdropFilter: 'blur(2px)',
            WebkitBackdropFilter: 'blur(2px)',
          }}
        />
      )}

      {/* Sidebar rendered outside the header so it isn't confined to the
          header's stacking context (position:sticky + z-index:100) */}
      <ul className="sidebar" style={{ display: sidebarOpen ? 'flex' : 'none' }}>
        <li onClick={handleSidebarToggle} className="crossburger" aria-label="Close menu">
          <svg xmlns="http://www.w3.org/2000/svg" height="26px" viewBox="0 -960 960 960" width="26px" fill="currentColor">
            <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
          </svg>
        </li>
        {NAV_ITEMS.map((item) => (
          <li key={item.label}>
            <a href={`#${item.id}`} onClick={(e) => handleNavClick(item.id, e)}>{item.label}</a>
          </li>
        ))}
      </ul>

      <header>
        {/* Curve for the corner logo blob, defined in objectBoundingBox units
            (0–1 fractions of the element box) so the SAME path scales to any
            box size — letting .logo-blob grow fluidly with the viewport while
            keeping the exact curve ratio (0.3358) used by the site's other lobes. */}
        <svg className="logo-blob-defs" width="0" height="0" aria-hidden="true" focusable="false">
          <defs>
            <clipPath id="logoBlobClip" clipPathUnits="objectBoundingBox">
              <path d="M0,1 V0 H1 C0.3358,0 0,0.3358 0,1 Z" />
            </clipPath>
          </defs>
        </svg>
        <div className="logo-blob" />
        <a
          className="app-logo"
          href="#home"
          onClick={(event) => {
            event.preventDefault();
            document.getElementById("home").scrollIntoView({ behavior: "smooth" });
          }}
        >
          <InstaxLogo className="app-logo-svg" />
        </a>
        <nav>
          <ul>
            {NAV_ITEMS.map((item) => (
              <li
                className={`hideOnMobile${item.id === "contact" ? " nav-right" : ""}`}
                key={item.label}
              >
                <a href={`#${item.id}`} onClick={(e) => handleNavClick(item.id, e)}>{item.label}</a>
              </li>
            ))}
            <li onClick={handleSidebarToggle} className="hamburger">
              <svg xmlns="http://www.w3.org/2000/svg" height="34px" viewBox="0 -960 960 960" width="34px" fill="black">
                <path d="M120-240v-80h720v80H120Zm0-200v-80h720v80H120Zm0-200v-80h720v80H120Z" />
              </svg>
            </li>
          </ul>
        </nav>
      </header>
    </>
  );
};

export default Navbar;
