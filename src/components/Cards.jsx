import camera1 from '../assets/camera1.jpg'
import camera2 from '../assets/camera2.jpg'
import camera3 from '../assets/camera3.jpg'

const Cards = () => {
  return (
  <div className="cards-container">
      <div className="card">
        <h3>Card 1</h3>
        <img src={camera1} alt="Camera 1" className="card-img"/>
        <p>This is the first card.</p>
      </div>
      <div className="card">
        <h3>Card 2</h3>
        <img src={camera2} alt="Camera 2" className="card-img"/>
        <p>This is the second card.</p>
      </div>
      <div className="card">
        <h3>Card 3</h3>
        <img src={camera3} alt="Camera 3" className="card-img"/>
        <p>This is the third card.</p>
      </div>
    </div>
  );
}

export default Cards;