import { useEffect, useRef, useState } from 'react'
import { Pause, Play, Volume2 } from 'lucide-react'

const formatTime = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${Math.floor(seconds % 60)
    .toString()
    .padStart(2, '0')}`

export function AudioPlayer({
  src,
  label,
  compact = false,
}: {
  src: string
  label: string
  compact?: boolean
}) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [current, setCurrent] = useState(0)
  const [error, setError] = useState(false)

  useEffect(() => {
    const audio = audioRef.current
    const pauseOther = (event: Event) => {
      if ((event as CustomEvent).detail !== audio) audio?.pause()
    }
    window.addEventListener('music-library-play', pauseOther)
    return () => window.removeEventListener('music-library-play', pauseOther)
  }, [])

  useEffect(() => {
    setCurrent(0)
    setDuration(0)
    setPlaying(false)
    setError(false)
  }, [src])

  const toggle = async () => {
    const audio = audioRef.current
    if (!audio) return
    if (!audio.paused) {
      audio.pause()
      return
    }
    window.dispatchEvent(new CustomEvent('music-library-play', { detail: audio }))
    try {
      await audio.play()
      setError(false)
    } catch {
      setError(true)
    }
  }

  return (
    <div
      className={`audio-player ${compact ? 'audio-compact' : ''} ${playing ? 'is-playing' : ''}`}
    >
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
        onTimeUpdate={(event) => setCurrent(event.currentTarget.currentTime)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onError={() => setError(true)}
      />
      <button
        type="button"
        className="play-button"
        onClick={toggle}
        aria-label={`${playing ? 'Pausar' : 'Reproduzir'} ${label}`}
      >
        {playing ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
      </button>
      <div className="audio-progress">
        <div className="audio-wave" aria-hidden="true">
          {Array.from({ length: 48 }, (_, i) => (
            <i
              key={i}
              style={{
                height: `${20 + ((i * 17 + 7) % 37)}%`,
                opacity: duration && i / 48 < current / duration ? 1 : 0.3,
              }}
            />
          ))}
        </div>
        <input
          type="range"
          min="0"
          max={duration || 1}
          value={current}
          step="0.1"
          aria-label={`Progresso de ${label}`}
          aria-valuetext={`${formatTime(current)} de ${formatTime(duration)}`}
          onChange={(event) => {
            if (audioRef.current) {
              audioRef.current.currentTime = Number(event.target.value)
              setCurrent(Number(event.target.value))
            }
          }}
        />
        <div className="audio-times">
          <span>{formatTime(current)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
      <Volume2 size={17} aria-hidden="true" className="audio-volume" />
      {error && (
        <p role="alert" className="audio-error">
          Não foi possível reproduzir. Tente novamente.
        </p>
      )}
    </div>
  )
}
