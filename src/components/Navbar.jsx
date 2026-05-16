import React, { useState } from "react";
import InstaxLogo from "./InstaxLogo";

const Navbar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleNavClick = (label, e) => {
    setSidebarOpen(false);
    if (label === "About") {
      e.preventDefault();
      document.getElementById("about").scrollIntoView({ behavior: "smooth" });
    } else if (label === "Home") {
      e.preventDefault();
      document.getElementById("home").scrollIntoView({ behavior: "smooth" });
    } else if (label === "Details") {
      e.preventDefault();
      document.getElementById("details").scrollIntoView({ behavior: "smooth" });
    } else if (label === "Contact") {
      e.preventDefault();
      document.getElementById("contact").scrollIntoView({ behavior: "smooth" });
    }
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
            background: 'rgba(0,0,0,0.25)',
          }}
        />
      )}

      {/* Sidebar rendered outside the header so it isn't confined to the
          header's stacking context (position:sticky + z-index:100) */}
      <ul className="sidebar" style={{ display: sidebarOpen ? 'flex' : 'none' }}>
        <li onClick={handleSidebarToggle} className="crossburger">
          <svg xmlns="http://www.w3.org/2000/svg" height="34px" viewBox="0 -960 960 960" width="34px" fill="black">
            <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
          </svg>
        </li>
        {[
          { label: "Home" },
          { label: "Details" },
          { label: "About" },
          { label: "Contact" },
        ].map((item) => (
          <li key={item.label}>
            <a href="#" onClick={(e) => handleNavClick(item.label, e)}>{item.label}</a>
          </li>
        ))}
      </ul>

      <header>
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
            {[
              { label: "Home" },
              { label: "Details" },
              { label: "About" },
              { label: "Contact" },
            ].map((item) => (
              <li className="hideOnMobile" key={item.label}>
                <a href="#" onClick={(e) => handleNavClick(item.label, e)}>{item.label}</a>
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
