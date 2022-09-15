import ReactPlayer from 'react-player/lazy'
import { createRef, useCallback, useRef, useState } from 'react'
import { Button, Typography } from 'antd'
import { PauseCircleOutlined, PlayCircleOutlined, StepBackwardOutlined } from '@ant-design/icons';
import 'antd/dist/antd.css'
import PlayheadSlider from './PlayheadSlider';

const twoDecimal = f => {
    return Math.round((f + Number.EPSILON) * 100) / 100
}

export default function JamStemPlayer({ songDef }) {
    console.log("(rerender)");

    const [medias] = useState(() => songDef.tracks.map(t => songDef.medias[t][0])) // we only take first media by track for now
    const duration = Math.max(...medias.map(m => m.duration))
    const readyMedias = useRef([])
    const [isAllMediaReady, setAllMediaReady] = useState(false)
    
    const [isPlaying, setIsPlaying] = useState(false)
    const [lastPosition, setLastPosition] = useState(null)
    
    const shouldPlayWhenAllReady = useRef(false)
    const shouldSeekWhenAllReady = useRef(0)
    const playerRefs = useRef([])
    playerRefs.current = medias.map((_, i) => playerRefs.current[i] ?? createRef())
    
    // when all medias are loaded, they are synchronised before playing
    function onReady(media) {
        readyMedias.current = [...readyMedias.current, medias.indexOf(media)]
        if(readyMedias.current.length === medias.length) {
            setAllMediaReady(true)
            if(shouldSeekWhenAllReady.current !== null) {
                seekTo(shouldSeekWhenAllReady.current)
                shouldSeekWhenAllReady.current = null
            }
            if(shouldPlayWhenAllReady.current) {
                setIsPlaying(true)
                shouldPlayWhenAllReady.current = false
            }
        }
    }

    const seekTo = useCallback((newPosition) => {
        if(!isPlaying && newPosition === lastPosition) {
            return
        }

        const wasPlaying = isPlaying
        if(wasPlaying) setIsPlaying(false)

        readyMedias.current = []
        setAllMediaReady(false)

        setLastPosition(twoDecimal(newPosition))

        playerRefs.current.forEach((ref, i) => ref.current.seekTo(newPosition + (medias[i].offset ?? 0)))
        shouldPlayWhenAllReady.current = shouldPlayWhenAllReady.current || wasPlaying
    }, [isPlaying, lastPosition, medias])

    // keep other players in sync when a player is seeked with the controls
    function syncPlayersWith(playerIdx, newPosition) {
        const globalPosition = twoDecimal(newPosition - medias[playerIdx].offset)
        if(lastPosition !== globalPosition) {
            seekTo(Math.max(globalPosition, 0))
        }
    }

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
            
            <PlayheadSlider
                duration={duration}
                isPlaying={isPlaying}
                lastPosition={lastPosition ?? 0}
                step={0.2}
                onSeek={p => seekTo(p)}
            />
            
            <div style={{display:'inline-grid', gridTemplateColumns: 'auto auto', gridTemplateRows: 'auto auto'}}>
            {medias.map((media, i) => <ReactPlayer
                                        key={media.name}
                                        url={songDef.basePath + '/' + media.url}
                                        controls={true}
                                        volume={media.volume ?? 1}
                                        onReady={() => onReady(media)}
                                        playing={isPlaying}
                                        onPause={() => setIsPlaying(false)}
                                        onPlay={() => setIsPlaying(true)}
                                        onSeek={seconds => syncPlayersWith(i, seconds)}
                                        ref={playerRefs.current[i]} />)}
            </div>

        </div>
  );
}
