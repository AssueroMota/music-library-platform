import { useEffect, useRef, useState, type ComponentProps, type RefObject } from 'react'
import { Maximize, Minimize, Pause, Play, Volume2, VolumeX } from 'lucide-react'

function clock(seconds: number) {
  const value = Math.max(0, Math.floor(seconds))
  const hours = Math.floor(value / 3600)
  const minutes = Math.floor((value % 3600) / 60)
  const rest = String(value % 60).padStart(2, '0')
  return hours ? `${hours}:${String(minutes).padStart(2, '0')}:${rest}` : `${minutes}:${rest}`
}

export function GuidedVideo({
  videoRef,
  ...props
}: Omit<ComponentProps<'video'>, 'ref' | 'controls'> & {
  videoRef: RefObject<HTMLVideoElement | null>
}) {
  const player = useRef<HTMLDivElement>(null)
  const [time, setTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  const [volume, setVolume] = useState(1)
  const [rate, setRate] = useState(1)
  const [fullscreen, setFullscreen] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [playError, setPlayError] = useState('')
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    const sync = () => {
      setTime(Number.isFinite(video.currentTime) ? video.currentTime : 0)
      setDuration(Number.isFinite(video.duration) ? video.duration : 0)
      setPlaying(!video.paused && !video.ended)
      setMuted(video.muted)
      setVolume(video.volume)
      setRate(video.playbackRate)
    }
    const events = [
      'loadedmetadata',
      'durationchange',
      'timeupdate',
      'play',
      'pause',
      'ended',
      'volumechange',
      'ratechange',
      'emptied',
    ]
    sync()
    events.forEach((event) => video.addEventListener(event, sync))
    return () => events.forEach((event) => video.removeEventListener(event, sync))
  }, [props.src, videoRef])
  useEffect(() => {
    const sync = () => setFullscreen(document.fullscreenElement === player.current)
    document.addEventListener('fullscreenchange', sync)
    return () => document.removeEventListener('fullscreenchange', sync)
  }, [])
  async function togglePlay() {
    const video = videoRef.current
    if (!video) return
    setPlayError('')
    if (!video.paused) video.pause()
    else {
      if (video.ended) video.currentTime = 0
      try {
        await video.play()
      } catch {
        setPlayError('Não foi possível iniciar. Toque em reproduzir para tentar novamente.')
      }
    }
  }
  async function toggleFullscreen() {
    if (expanded) {
      setExpanded(false)
      return
    }
    if (document.fullscreenElement === player.current) {
      await document.exitFullscreen()
      return
    }
    try {
      if (player.current?.requestFullscreen) await player.current.requestFullscreen()
      else setExpanded(true)
    } catch {
      setExpanded(true)
    }
  }
  return (
    <div
      ref={player}
      className={`guided-video-player${expanded ? ' is-expanded' : ''}`}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && expanded) {
          event.preventDefault()
          event.stopPropagation()
          setExpanded(false)
        }
      }}
    >
      <video {...props} ref={videoRef} onClick={() => void togglePlay()} />
      <div className="guided-video-controls" role="group" aria-label="Controles do vídeo">
        <input
          className="guided-video-progress"
          type="range"
          aria-label="Progresso do vídeo"
          aria-valuetext={`${clock(time)} de ${clock(duration)}`}
          min={0}
          max={duration || 1}
          step={0.1}
          value={Math.min(time, duration || 0)}
          disabled={!duration}
          onChange={(event) => {
            if (videoRef.current) {
              const next = Number(event.target.value)
              videoRef.current.currentTime = next
              setTime(next)
            }
          }}
        />
        <div className="guided-video-toolbar">
          <button
            type="button"
            onClick={() => void togglePlay()}
            aria-label={playing ? 'Pausar vídeo' : 'Reproduzir vídeo'}
          >
            {playing ? <Pause size={20} /> : <Play size={20} />}
          </button>
          <span className="guided-video-time" aria-label="Tempo do vídeo">
            {clock(time)} / {clock(duration)}
          </span>
          <span className="guided-video-remaining">
            {duration ? `Faltam ${clock(Math.max(0, duration - time))}` : 'Carregando duração…'}
          </span>
          <div className="guided-video-volume">
            <button
              type="button"
              aria-label={muted ? 'Ativar som' : 'Silenciar vídeo'}
              onClick={() => {
                if (videoRef.current) videoRef.current.muted = !videoRef.current.muted
              }}
            >
              {muted || !volume ? <VolumeX size={19} /> : <Volume2 size={19} />}
            </button>
            <input
              type="range"
              aria-label="Volume do vídeo"
              min={0}
              max={1}
              step={0.05}
              value={muted ? 0 : volume}
              onChange={(event) => {
                if (videoRef.current) {
                  videoRef.current.volume = Number(event.target.value)
                  videoRef.current.muted = false
                }
              }}
            />
          </div>
          <select
            aria-label="Velocidade do vídeo"
            value={rate}
            onChange={(event) => {
              if (videoRef.current) videoRef.current.playbackRate = Number(event.target.value)
            }}
          >
            {[0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => (
              <option key={speed} value={speed}>
                {speed}×
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => void toggleFullscreen()}
            aria-label={fullscreen || expanded ? 'Sair da tela cheia' : 'Tela cheia'}
          >
            {fullscreen || expanded ? <Minimize size={20} /> : <Maximize size={20} />}
          </button>
        </div>
        {playError && (
          <p role="alert" className="guided-video-error">
            {playError}
          </p>
        )}
      </div>
    </div>
  )
}
