const Cards = () => {
  return (
    <div className="card-grid">
      <div className="card reveal">
        <div className="card__background"></div>
        <div className="card__content">
          <p className="card__category"> Experience</p>
          <h3 className="card__heading">Interactive 3D Camera Viewer</h3>
        </div>
      </div>
      <div className="card reveal">
        <div className="card__background"></div>
        <div className="card__content">
          <p className="card__category">Customization</p>
          <h3 className="card__heading">Real-Time Product Controls</h3>
        </div>
      </div>
      <div className="card reveal">
        <div className="card__background"></div>
        <div className="card__content">
          <p className="card__category">Product Detail</p>
          <h3 className="card__heading">ACCESSORIES</h3>
        </div>
      </div>
    </div>
  );
}

export default Cards;
