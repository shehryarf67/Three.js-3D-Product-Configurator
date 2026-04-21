import {gsap, useGSAP} from '../imports.js'
import showcaseVideo from "../assets/INSTAX mini 12 Fill your world with joy_FUJIFILM - FUJIFILMglobal (1080p, h264).mp4";


const Showcase = () => {

    return(
        <section className="showcase">
            <div className="media">
                <video src={showcaseVideo} autoPlay loop muted></video>
            </div>
        </section>
    )
}

export default Showcase;