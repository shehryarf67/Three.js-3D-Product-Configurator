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

  return (
    <header>
      <nav>
        <ul>
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
      </nav>
    </header>
  );
};

export default Navbar;