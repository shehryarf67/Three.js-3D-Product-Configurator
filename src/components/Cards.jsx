import camerasBase from "../assets/CARDS/CAM 1.webp";
import camerasHover from "../assets/CARDS/CAM 2 (1).webp";
import filmsBase from "../assets/CARDS/FILM 1.webp";
import filmsHover from "../assets/CARDS/FILM 2 (1).webp";
import accessoriesBase from "../assets/CARDS/ACC 1.webp";
import accessoriesHover from "../assets/CARDS/ACC 2 (1).webp";

const cards = [
  {
    category: "Customization",
    heading: "Cameras",
    background: camerasBase,
    hoverBackground: camerasHover,
    hoverCopy: [
      [{ text: "Browse", color: "pink" }],
      [{ text: "the full", color: "pink" }],
      [{ text: "lineup!", color: "white" }],
    ],
  },
  {
    category: "Experience",
    heading: "Films",
    background: filmsBase,
    hoverBackground: filmsHover,
    hoverCopy: [
      [{ text: "Explore", color: "pink" }],
      [
        { text: "our ", color: "pink" },
        { text: "film", color: "white" },
      ],
      [{ text: "designs!", color: "pink" }],
    ],
  },
  {
    category: "Product Detail",
    heading: "Accessories",
    background: accessoriesBase,
    hoverBackground: accessoriesHover,
    hoverCopy: [
      [{ text: "Discover", color: "pink" }],
      [{ text: "camera", color: "white" }],
      [{ text: "essentials!", color: "pink" }],
    ],
  },
];

const Cards = () => {
  return (
    <div className="card-grid">
      {cards.map((card) => (
        <div className="card reveal" key={card.heading}>
          <div
            className="card__background"
            style={{ backgroundImage: `url(${card.background})` }}
          />
          <img
            className="card__hover-image"
            src={card.hoverBackground}
            alt=""
            aria-hidden="true"
          />
          <div className="card__content">
            <p className="card__category">{card.category}</p>
            <h3 className="card__heading">{card.heading}</h3>
          </div>
          <div className="card__hover-copy" aria-hidden="true">
            {card.hoverCopy.map((line, lineIndex) => (
              <span className="card__hover-line" key={`${card.heading}-${lineIndex}`}>
                {line.map((part) => (
                  <span
                    className={`card__hover-word card__hover-word--${part.color}`}
                    key={`${card.heading}-${lineIndex}-${part.text}`}
                  >
                    {part.text}
                  </span>
                ))}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default Cards;
