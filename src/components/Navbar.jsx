import { IoLogoCodepen } from "../imports.js";

const Navbar = () => {
  const handleNavClick = (label, e) => {
    if (label === "About") {
      e.preventDefault();
      document.getElementById("about").scrollIntoView({ behavior: "smooth" });
    }
    else if (label === "Home") {
      e.preventDefault();
      document.getElementById("canvas").scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header>
      <nav>
        <IoLogoCodepen size={64} />
        <ul>
          {[
            { label: "Home" },
            { label: "About" },
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