import 'antd/dist/antd.css'
import { Slider } from 'antd'

export default function PlayheadSlider({duration, position, isSeeking, seekTo, ...props}) {

    return <Slider {...props}
            />
}