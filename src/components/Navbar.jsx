import React from "react";

const Navbar = () => {
  const handleNavClick = (label, e) => {
    if (label === "About") {
      e.preventDefault();
      document.getElementById("about").scrollIntoView({ behavior: "smooth" });
    }
    else if (label === "Home") {
      e.preventDefault();
      document.getElementById("home").scrollIntoView({ behavior: "smooth" });
    }
    else if (label === "Details") {
      e.preventDefault();
      document.getElementById("details").scrollIntoView({ behavior: "smooth" });
    }
    else if (label === "Contact") {
      e.preventDefault();
      document.getElementById("contact").scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSidebarToggle = () => {
    const sidebar = document.querySelector(".sidebar");
    if (sidebar.style.display === 'flex') {
      sidebar.style.display = 'none';
    } else {
      sidebar.style.display = 'flex';
    }
  }

  return (
    <header>
      <nav>
        <ul className="sidebar">
          <li onClick={handleSidebarToggle} className="crossburger">
            <svg xmlns="http://www.w3.org/2000/svg" height="34px" viewBox="0 -960 960 960" width="34px" fill="black"><path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" /></svg>
          </li>
          {[
            { label: "Home" },
            { label: "About" },
            { label: "Details" },
            { label: "Contact" },
          ].map((item) => (
            <li key={item.label}>
              <a href="#" onClick={(e) => handleNavClick(item.label, e)}>{item.label}</a>
            </li>
          ))}
        </ul>
        <ul>
          {[
            { label: "Home" },
            { label: "About" },
            { label: "Details" },
            { label: "Contact" }
          ].map((item) => (
            <li className="hideOnMobile" key={item.label}>
              <a href="#" onClick={(e) => handleNavClick(item.label, e)}>{item.label}</a>
            </li>
          ))}
          <li onClick={handleSidebarToggle} className="hamburger">
            <svg xmlns="http://www.w3.org/2000/svg" height="34px" viewBox="0 -960 960 960" width="34px" fill="black"><path d="M120-240v-80h720v80H120Zm0-200v-80h720v80H120Zm0-200v-80h720v80H120Z" /></svg> </li>
        </ul>
      </nav>
    </header>
  );
};

export default Navbar;