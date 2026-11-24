import { useCallback, useEffect, useRef, useState, type MouseEvent } from 'react'
import { Play, Volume2 } from 'lucide-react'
import { englishSite } from '../lib/site-language'

export function PresentationVideo({ src, poster }: { src: string; poster: string }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [started, setStarted] = useState(false)
  const [failed, setFailed] = useState(false)
  const [muted, setMuted] = useState(false)

  const showError = useCallback(() => {
    setStarted(false)
    setFailed(true)
  }, [])

  const play = useCallback(
    (video: HTMLVideoElement, canRetryMuted?: () => boolean) => {
      const handleError = (error: unknown) => {
        if (error instanceof DOMException) {
          if (error.name === 'AbortError' || (canRetryMuted && error.name === 'NotAllowedError')) {
            return
          }
        }
        showError()
      }

      void video.play().catch((error: unknown) => {
        if (
          error instanceof DOMException &&
          error.name === 'NotAllowedError' &&
          video.paused &&
          !video.muted &&
          canRetryMuted?.()
        ) {
          video.muted = true
          return video.play().catch(handleError)
        }
        handleError(error)
      })
    },
    [showError],
  )

  useEffect(() => {
    const video = videoRef.current!
    let inView = typeof IntersectionObserver === 'undefined'
    let resumeWhenVisible = true
    let automaticRequest = 0

    const isVisible = () =>
      (inView || document.fullscreenElement === video) && document.visibilityState !== 'hidden'

    const syncVisibility = () => {
      if (!isVisible()) {
        automaticRequest++
        if (!video.paused) {
          resumeWhenVisible = true
          video.pause()
        }
        return
      }
      if (!resumeWhenVisible) return
      resumeWhenVisible = false
      if (video.getAttribute('src') !== src) video.src = src
      const request = ++automaticRequest
      if (video.paused) play(video, () => request === automaticRequest && isVisible())
    }

    const onOtherMedia = (player: unknown) => {
      if (!(player instanceof HTMLMediaElement) || player === video) return
      // The visit playlist can initialize before the video has entered the viewport.
      if (!video.hasAttribute('src')) return
      if (player.hasAttribute('data-visit-autoplay') && isVisible() && !video.paused) {
        if (!player.paused) player.pause()
        return
      }
      automaticRequest++
      resumeWhenVisible = false
      if (!video.paused) video.pause()
    }
    const onMediaPlay = (event: Event) => onOtherMedia(event.target)
    const onOtherPlayer = (event: Event) => onOtherMedia((event as CustomEvent).detail)

    const observer = inView
      ? null
      : new IntersectionObserver(
          ([entry]) => {
            inView = entry.isIntersecting && entry.intersectionRatio >= 0.35
            syncVisibility()
          },
          { threshold: 0.35 },
        )
    observer?.observe(video)
    document.addEventListener('visibilitychange', syncVisibility)
    document.addEventListener('fullscreenchange', syncVisibility)
    document.addEventListener('play', onMediaPlay, true)
    window.addEventListener('music-library-play', onOtherPlayer)
    if (!observer) syncVisibility()
    return () => {
      automaticRequest++
      observer?.disconnect()
      document.removeEventListener('visibilitychange', syncVisibility)
      document.removeEventListener('fullscreenchange', syncVisibility)
      document.removeEventListener('play', onMediaPlay, true)
      window.removeEventListener('music-library-play', onOtherPlayer)
      if (!video.paused) video.pause()
    }
  }, [play, src])

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
    video.muted = false
    video.focus({ preventScroll: true })
    play(video)
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
          setMuted(event.currentTarget.muted)
          setStarted(true)
          window.dispatchEvent(
            new CustomEvent('music-library-play', { detail: event.currentTarget }),
          )
        }}
        onVolumeChange={(event) => setMuted(event.currentTarget.muted)}
        onError={showError}
      >
        <track
          kind="subtitles"
          src="/videos/music-library-intro.en.vtt"
          srcLang="en"
          label="English"
          default={englishSite}
        />
      </video>
      {started && muted && (
        <button
          className="presentation-unmute"
          type="button"
          onClick={() => {
            const video = videoRef.current!
            video.muted = false
            video.focus({ preventScroll: true })
            if (video.paused) play(video)
          }}
        >
          <Volume2 size={17} aria-hidden="true" /> Ativar som
        </button>
      )}
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
