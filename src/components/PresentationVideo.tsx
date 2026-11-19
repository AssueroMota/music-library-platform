import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { Play } from 'lucide-react'

export function PresentationVideo({ src, poster }: { src: string; poster: string }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [started, setStarted] = useState(false)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const video = videoRef.current!
    const pause = () => {
      if (!video.paused) video.pause()
    }
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') pause()
    }
    const onOtherMedia = (event: Event) => {
      if (event.target instanceof HTMLMediaElement && event.target !== video) pause()
    }
    const onOtherPlayer = (event: Event) => {
      if ((event as CustomEvent).detail !== video) pause()
    }
    const observer =
      typeof IntersectionObserver === 'undefined'
        ? null
        : new IntersectionObserver(([entry]) => {
            if (!entry.isIntersecting) pause()
          })
    observer?.observe(video)
    document.addEventListener('visibilitychange', onVisibility)
    document.addEventListener('play', onOtherMedia, true)
    window.addEventListener('music-library-play', onOtherPlayer)
    return () => {
      observer?.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      document.removeEventListener('play', onOtherMedia, true)
      window.removeEventListener('music-library-play', onOtherPlayer)
      pause()
    }
  }, [])

  function showError() {
    setStarted(false)
    setFailed(true)
  }

  function start(event: MouseEvent<HTMLAnchorElement>) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    const video = videoRef.current
    if (!video) return
    event.preventDefault()
    setFailed(false)
    setStarted(true)
    // Attach the source in the interaction so the browser retains playback permission.
    if (video.getAttribute('src') !== src) video.src = src
    else if (video.error) video.load()
    video.focus({ preventScroll: true })
    void video.play().catch((error: unknown) => {
      if (!(error instanceof DOMException && error.name === 'AbortError')) showError()
    })
  }

  return (
    <div id="apresentacao" className="presentation-player">
      <img
        className="presentation-backdrop"
        src={poster}
        alt=""
        width={540}
        height={960}
        fetchPriority="high"
      />
      <video
        ref={videoRef}
        controls={started}
        playsInline
        preload="none"
        poster={poster}
        tabIndex={started ? 0 : -1}
        aria-label="Vídeo de apresentação da Music Library"
        onPlay={(event) => {
          window.dispatchEvent(
            new CustomEvent('music-library-play', { detail: event.currentTarget }),
          )
        }}
        onError={showError}
      />
      {!started && (
        <a className="presentation-video-start" href={src} onClick={start}>
          <span className="presentation-play-icon">
            <Play fill="currentColor" aria-hidden="true" />
          </span>
          <span>{failed ? 'Tentar reproduzir' : 'Assistir à apresentação'}</span>
        </a>
      )}
      {failed && (
        <p className="presentation-error" role="alert">
          O vídeo falhou ao carregar. <a href={src}>Abrir o arquivo de vídeo</a>
        </p>
      )}
    </div>
  )
}
