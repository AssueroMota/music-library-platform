import { useEffect, useRef, useState } from 'react'
import { Play } from 'lucide-react'

export function PresentationVideo({ src, poster }: { src: string; poster: string }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const start = useRef<() => void>(() => {})
  const [needsInteraction, setNeedsInteraction] = useState(false)

  useEffect(() => {
    const video = videoRef.current!
    let mounted = true
    let inView = false
    let shouldPlay = false
    let waitingForGesture = false
    let pending = false
    let version = 0
    const tabIsVisible = () => document.visibilityState !== 'hidden'

    function pause() {
      version++
      pending = false
      video.pause()
    }
    async function play() {
      if (!inView || !shouldPlay || pending || !tabIsVisible()) return
      const request = ++version
      pending = true
      waitingForGesture = false
      try {
        await video.play()
        // Leaving during buffering must not let an old play request restart the sound.
        if (!mounted || !inView || !shouldPlay || !tabIsVisible()) video.pause()
        if (!mounted || request !== version) return
        setNeedsInteraction(false)
      } catch (error) {
        if (!mounted || request !== version || !inView || !shouldPlay) return
        waitingForGesture = error instanceof DOMException && error.name === 'NotAllowedError'
        setNeedsInteraction(waitingForGesture)
      } finally {
        if (request === version) pending = false
      }
    }
    start.current = () => {
      shouldPlay = true
      void play()
    }
    function onPlay() {
      if (!inView || !tabIsVisible()) {
        pause()
        return
      }
      shouldPlay = true
      waitingForGesture = false
      setNeedsInteraction(false)
      window.dispatchEvent(new CustomEvent('music-library-play', { detail: video }))
    }
    function onPause() {
      if (inView && tabIsVisible()) shouldPlay = false
    }
    function onEnded() {
      shouldPlay = false
    }
    function onVisibility() {
      if (!tabIsVisible()) pause()
      else void play()
    }
    function onOtherPlayer(event: Event) {
      if ((event as CustomEvent).detail === video) return
      shouldPlay = false
      waitingForGesture = false
      setNeedsInteraction(false)
      pause()
    }
    function onOtherMedia(event: Event) {
      if (event.target instanceof HTMLMediaElement && event.target !== video) onOtherPlayer(event)
    }
    function onInteraction(event: Event) {
      if (!waitingForGesture || !inView || !shouldPlay) return
      if (event instanceof KeyboardEvent && (event.repeat || !['Enter', ' '].includes(event.key)))
        return
      if (
        event.target instanceof Element &&
        event.target.closest(
          'button, a, input, textarea, select, video, audio, .visit-playlist, .audio-player, [contenteditable="true"]',
        )
      )
        return
      void play()
    }
    const observer =
      typeof IntersectionObserver === 'undefined'
        ? null
        : new IntersectionObserver(
            ([entry]) => {
              const visible = entry.isIntersecting && entry.intersectionRatio >= 0.35
              if (visible === inView) return
              inView = visible
              shouldPlay = visible
              if (visible) void play()
              else {
                waitingForGesture = false
                setNeedsInteraction(false)
                pause()
              }
            },
            { threshold: [0, 0.35] },
          )
    // Keep manual controls usable in browsers without viewport observation.
    if (observer) observer.observe(video)
    else inView = true
    video.addEventListener('play', onPlay)
    video.addEventListener('pause', onPause)
    video.addEventListener('ended', onEnded)
    document.addEventListener('visibilitychange', onVisibility)
    document.addEventListener('play', onOtherMedia, true)
    document.addEventListener('click', onInteraction)
    document.addEventListener('keydown', onInteraction)
    window.addEventListener('music-library-play', onOtherPlayer)
    return () => {
      mounted = false
      shouldPlay = false
      observer?.disconnect()
      video.removeEventListener('play', onPlay)
      video.removeEventListener('pause', onPause)
      video.removeEventListener('ended', onEnded)
      document.removeEventListener('visibilitychange', onVisibility)
      document.removeEventListener('play', onOtherMedia, true)
      document.removeEventListener('click', onInteraction)
      document.removeEventListener('keydown', onInteraction)
      window.removeEventListener('music-library-play', onOtherPlayer)
      start.current = () => {}
      pause()
    }
  }, [src])

  return (
    <>
      <video
        ref={videoRef}
        controls
        playsInline
        muted={false}
        preload="metadata"
        width={720}
        height={1280}
        poster={poster}
        aria-label="Apresentação da Music Library para violinistas"
      >
        <source src={src} type="video/mp4" />
        Seu navegador não suporta este vídeo. <a href={src}>Abrir o vídeo de apresentação.</a>
      </video>
      {needsInteraction && (
        <button className="presentation-video-start" onClick={() => start.current()}>
          <Play size={18} fill="currentColor" /> Assistir com som
        </button>
      )}
    </>
  )
}
