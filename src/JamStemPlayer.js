import ReactPlayer from 'react-player/lazy'
import { createRef, useCallback, useRef, useState } from 'react'
import { Button, Slider, Typography } from 'antd'
import { PauseCircleOutlined, PlayCircleOutlined, StepBackwardOutlined } from '@ant-design/icons';
import 'antd/dist/antd.css'
import PlayheadSlider from './PlayheadSlider';

export default function JamStemPlayer({ songDef }) {
    console.log("(rerender)");

    const [medias] = useState(() => songDef.tracks.map(t => songDef.medias[t][0])) // we only take first media by track for now
    console.dir(medias)
    const duration = Math.max(...medias.map(m => m.duration))
    console.log(duration);
    const readyMedias = useRef([])
    const [isAllMediaReady, setAllMediaReady] = useState(false)
    
    const [isPlaying, setIsPlaying] = useState(false)
    const position = useRef(0.1)
    const isSeeking = useRef(false)
    
    const shouldPlayWhenAllReady = useRef(false)
    const shouldSeekWhenAllReady = useRef(0)
    const playerRefs = useRef([])
    playerRefs.current = medias.map((_, i) => playerRefs.current[i] ?? createRef())
    
    // when all medias are loaded, they are synchronised before playing
    function onReady(media) {
        console.log(`   (a media is ready)`)
        readyMedias.current = [...readyMedias.current, medias.indexOf(media)]
        if(readyMedias.current.length === medias.length) {
            console.log(`   (all medias ready !)`)
            setAllMediaReady(true)
            if(shouldSeekWhenAllReady.current !== null) {
                console.log(`   (so let's seek)`)
                seekTo(shouldSeekWhenAllReady.current)
                shouldSeekWhenAllReady.current = null
            }
            if(shouldPlayWhenAllReady.current) {
                console.log(`   (so lets play)`)
                setIsPlaying(true)
                shouldPlayWhenAllReady.current = false
            }
        }
    }

    const seekTo = useCallback(newPosition => {
        console.log(`       seekTo(${newPosition}) (current pos = ${position.current})`)
        if(newPosition == position.current) {
            console.log("YES YE SYES")
            return
        }

        const wasPlaying = isPlaying
        if(wasPlaying) setIsPlaying(false)

        readyMedias.current = []
        setAllMediaReady(false)

        position.current = newPosition.toFixed(2)

        playerRefs.current.forEach((ref, i) => ref.current.seekTo(newPosition + (medias[i].offset ?? 0)))
        shouldPlayWhenAllReady.current = wasPlaying
    }, [isPlaying, medias])

    // keep other players in sync when a player is seeked with the controls
    /*function syncPlayersWith(playerIdx, newPosition) {
        const globalPosition = (newPosition - medias[playerIdx].offset).toFixed(2)
        if(position !== globalPosition) {
            console.log(`[syncPlayersWith(${playerIdx},${newPosition})] at global pos ${globalPosition}`)
            seekTo(Math.max(globalPosition, 0))
        } else {
            console.log(`[syncPlayersWith] (unnecessary)`)
        }
    }*/

    return (
        <div>

            <Typography>{songDef.name}</Typography>

            <Button size='large' icon={<StepBackwardOutlined />}
            onClick={() => seekTo(0)} />
            
            <Button size='large' icon={isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                onClick={() => setIsPlaying(!isPlaying)}
                disabled={!isAllMediaReady}
            />

            <Button size='large' onClick={() => seekTo(duration / 2)}>
                Seek middle
            </Button>
            
            <PlayheadSlider min={0} max={duration} value={position.current}
                    onMouseDown={() => isSeeking.current = true}
                    onChange={() => {}}
                    onMouseUp={(e) => {
                        isSeeking.current = false
                        seekTo(parseFloat(e.target.value))
                    }}
            />
            
            <div style={{display:'inline-grid', gridTemplateColumns: 'auto auto', gridTemplateRows: 'auto auto'}}>
            {medias.map((media, i) => <ReactPlayer
                                        key={media.name}
                                        url={songDef.basePath + '/' + media.url}
                                        controls={false}
                                        volume={media.volume ?? 1}
                                        onReady={() => onReady(media)}
                                        playing={isPlaying}
                                        onPause={() => setIsPlaying(false)}
                                        onPlay={() => setIsPlaying(true)}
                                        
                                        ref={playerRefs.current[i]} />)}
            </div>

        </div>
  ); // onSeek={seconds => syncPlayersWith(i, seconds)} // (position : {position})
}
