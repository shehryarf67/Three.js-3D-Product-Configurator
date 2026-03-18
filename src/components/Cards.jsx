import camera1 from '../assets/camera1.jpg'
import camera2 from '../assets/camera2.jpg'
import camera3 from '../assets/camera3.jpg'

const Cards = () => {
  return (
    <div className="card-grid">
      <div className="card reveal">
        <div className="card__background" style={{backgroundImage: `url(${camera1})`}}></div>
        <div className="card__content">
          <p className="card__category"> Experience</p>
          <h3 className="card__heading">Interactive 3D Camera Viewer</h3>
        </div>
      </div>
      <div className="card reveal">
        <div className="card__background" style={{backgroundImage: `url(${camera2})`}}></div>
        <div className="card__content">
          <p className="card__category">Customization</p>
          <h3 className="card__heading">Real-Time Product Controls</h3>
        </div>
      </div>
      <div className="card reveal">
        <div className="card__background" style={{backgroundImage: `url(${camera3})`}}></div>
        <div className="card__content">
          <p className="card__category">Product Detail</p>
          <h3 className="card__heading">Explore Every Component</h3>
        </div>
      </div>
    </div>
  );
}

export default Cards;