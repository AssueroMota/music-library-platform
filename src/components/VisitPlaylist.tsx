import { useEffect, useRef, useState } from 'react'
import {
  Headphones,
  Maximize2,
  Minus,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume2,
} from 'lucide-react'
import { visitPlaylist } from '../data/visit-playlist'
import '../styles/visit-playlist.css'

const preferenceKey = 'ml:visit-music-paused'
const minimizedKey = 'ml:visit-music-minimized'
function startsMinimized() {
  try {
    return sessionStorage.getItem(minimizedKey) === 'true'
  } catch {
    return false
  }
}
function startsPlaying() {
  try {
    return sessionStorage.getItem(preferenceKey) !== 'true'
  } catch {
    return true
  }
}
function rememberPaused(paused: boolean) {
  try {
    sessionStorage.setItem(preferenceKey, String(paused))
  } catch {
    // Playback remains usable when browser storage is unavailable.
  }
}

export function VisitPlaylist() {
  const audioRef = useRef<HTMLAudioElement>(null)
  const shouldPlay = useRef(startsPlaying())
  const attempt = useRef({ version: 0 })
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [minimized, setMinimized] = useState(startsMinimized)
  const [volume, setVolume] = useState(20)
  const [status, setStatus] = useState('Sua visita tem trilha sonora.')
  const track = visitPlaylist[index]

  async function play() {
    const audio = audioRef.current
    if (!audio) return
    const request = ++attempt.current.version
    shouldPlay.current = true
    try {
      await audio.play()
    } catch (error) {
      if (request !== attempt.current.version) return
      setPlaying(false)
      if (error instanceof DOMException && error.name === 'AbortError') return
      setStatus(
        error instanceof DOMException && error.name === 'NotAllowedError'
          ? 'Toque no play para ouvir.'
          : 'Não foi possível tocar. Tente o play ou outra faixa.',
      )
    }
  }

  function pause() {
    shouldPlay.current = false
    attempt.current.version++
    audioRef.current?.pause()
    setPlaying(false)
    setStatus('Música pausada.')
  }

  function selectTrack(next: number) {
    rememberPaused(false)
    if (next === index) {
      void play()
      return
    }
    pause()
    shouldPlay.current = true
    setIndex(next)
  }

  useEffect(() => {
    const audio = audioRef.current!
    const pendingAttempt = attempt.current
    if (shouldPlay.current) void play()
    return () => {
      pendingAttempt.version++
      audio.pause()
    }
  }, [index])

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume / 100
  }, [volume])

  useEffect(() => {
    const pauseForMedia = (event: Event) => {
      if (event.target instanceof HTMLMediaElement && event.target !== audioRef.current) pause()
    }
    const pauseForPlayer = (event: Event) => {
      if ((event as CustomEvent).detail !== audioRef.current) pause()
    }
    document.addEventListener('play', pauseForMedia, true)
    window.addEventListener('music-library-play', pauseForPlayer)
    return () => {
      document.removeEventListener('play', pauseForMedia, true)
      window.removeEventListener('music-library-play', pauseForPlayer)
    }
  }, [])

  const playButton = (
    <button
      type="button"
      className="visit-playlist-toggle"
      aria-label={playing ? 'Pausar música da visita' : 'Reproduzir música da visita'}
      onClick={() => {
        if (playing) {
          pause()
          rememberPaused(true)
        } else {
          rememberPaused(false)
          void play()
        }
      }}
    >
      {playing ? <Pause size={17} fill="currentColor" /> : <Play size={17} fill="currentColor" />}
    </button>
  )

  return (
    <aside
      className={`visit-playlist${minimized ? ' is-minimized' : ''}`}
      aria-label="Músicas para sua visita"
      title={minimized ? track.title : undefined}
    >
      <audio
        ref={audioRef}
        src={track.src}
        preload="metadata"
        onPlay={(event) => {
          setPlaying(true)
          setStatus(`Ouvindo · ${visitPlaylist[index].context}`)
          window.dispatchEvent(
            new CustomEvent('music-library-play', { detail: event.currentTarget }),
          )
        }}
        onPause={() => setPlaying(false)}
        onEnded={() => selectTrack((index + 1) % visitPlaylist.length)}
        onError={() => {
          setPlaying(false)
          setStatus('Faixa indisponível. Escolha outra música.')
        }}
      />
      <div className="visit-playlist-heading">
        <Headphones size={15} aria-hidden="true" />
        {!minimized && (
          <>
            <span>UMA TRILHA PARA SUA VISITA</span>
            <span className="visit-playlist-position">
              {index + 1}/{visitPlaylist.length}
            </span>
          </>
        )}
        {minimized && playButton}
        <button
          key="resize"
          type="button"
          className="visit-playlist-resize"
          aria-label={minimized ? 'Expandir player de música' : 'Minimizar player de música'}
          aria-expanded={!minimized}
          title={minimized ? 'Expandir player de música' : 'Minimizar player de música'}
          onClick={() => {
            const next = !minimized
            setMinimized(next)
            try {
              sessionStorage.setItem(minimizedKey, String(next))
            } catch {
              /* Optional preference. */
            }
          }}
        >
          {minimized ? <Maximize2 size={17} /> : <Minus size={19} />}
        </button>
      </div>
      {!minimized && (
        <>
          <label className="sr-only" htmlFor="visit-track">
            Escolher música da visita
          </label>
          <select
            id="visit-track"
            value={index}
            onChange={(event) => selectTrack(Number(event.target.value))}
          >
            {visitPlaylist.map((item, position) => (
              <option value={position} key={item.src}>
                {item.title}
              </option>
            ))}
          </select>
          <div className="visit-playlist-controls">
            <button
              type="button"
              aria-label="Música anterior"
              onClick={() => selectTrack((index - 1 + visitPlaylist.length) % visitPlaylist.length)}
            >
              <SkipBack size={17} />
            </button>
            {playButton}
            <button
              type="button"
              aria-label="Próxima música"
              onClick={() => selectTrack((index + 1) % visitPlaylist.length)}
            >
              <SkipForward size={17} />
            </button>
            <Volume2 size={15} aria-hidden="true" />
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              aria-label="Volume da música da visita"
              aria-valuetext={`${volume}%`}
              onChange={(event) => setVolume(Number(event.target.value))}
            />
          </div>
          <p role="status">{status}</p>
        </>
      )}
    </aside>
  )
}
