import 'antd/dist/antd.css'
import { Slider } from 'antd'
import { useEffect, useState } from 'react'

export default function PlayheadSlider({duration, step, isPlaying, lastPosition, onSeek, ...props}) {

    const [position, setPosition] = useState(0)

    useEffect(() => {
        setPosition(lastPosition)
    }, [lastPosition])

    useEffect(() => {
        if(isPlaying) {
            const interval = setInterval(() => {
                setPosition(p => p + step)
            }, step*1000)
            return () => clearInterval(interval)
        }
    }, [isPlaying, step])

    return <Slider
            min={0} max={duration} step={step}
            value={position}
            onChange={e => onSeek(e)}
            tooltip={{formatter: s => Math.floor(s/60) + 'm' + Math.round(s%60) }}
            {...props} />
}