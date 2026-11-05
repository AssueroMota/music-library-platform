import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { BookOpen, LoaderCircle, RefreshCw } from 'lucide-react'
import type { MemberAsset } from '../../shared/library'
import { mediaAccessUrl } from '../lib/media-access'
const ScorePdf = lazy(() => import('./ScorePdf').then((module) => ({ default: module.ScorePdf })))

export function ProtectedMedia({
  asset,
  token,
  previewMedia,
  autoPlay = false,
  minimal = false,
}: {
  asset: MemberAsset
  token: string
  previewMedia?: Readonly<Record<string, string>>
  autoPlay?: boolean
  minimal?: boolean
}) {
  const currentToken = useRef(token)
  const videoRef = useRef<HTMLVideoElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')
  const [refresh, setRefresh] = useState(0)
  const [ready, setReady] = useState(false)
  const [waitingLonger, setWaitingLonger] = useState(false)
  const [needsPlay, setNeedsPlay] = useState(false)
  const [buffering, setBuffering] = useState(false)
  const recoveryAttempts = useRef(0)
  const restoring = useRef<{ time: number; playing: boolean } | null>(null)
  const playIntent = useRef(autoPlay)
  const retrying = useRef(false)
  const mounted = useRef(false)
  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])
  const tryPlay = useCallback((media: HTMLMediaElement) => {
    void media.play().catch((reason: unknown) => {
      if (
        mounted.current &&
        media.isConnected &&
        reason instanceof DOMException &&
        reason.name === 'NotAllowedError'
      )
        setNeedsPlay(true)
    })
  }, [])
  const loaded = useCallback(() => {
    retrying.current = false
    setReady(true)
    setWaitingLonger(false)
  }, [])
  const retry = useCallback((automatic = false) => {
    if (automatic && retrying.current) return
    retrying.current = true
    const media = audioRef.current ?? videoRef.current
    if (media) restoring.current = { time: media.currentTime || 0, playing: playIntent.current }
    if (!automatic) recoveryAttempts.current = 0
    setError('')
    setReady(false)
    setWaitingLonger(false)
    setNeedsPlay(false)
    setBuffering(false)
    setUrl('')
    setRefresh((value) => value + 1)
  }, [])
  const loadError = useCallback(() => {
    if (retrying.current) return
    if (!previewMedia && recoveryAttempts.current < 1) {
      recoveryAttempts.current++
      retry(true)
    } else {
      const media = audioRef.current ?? videoRef.current
      if (media) restoring.current = { time: media.currentTime || 0, playing: playIntent.current }
      media?.pause()
      setError('Não foi possível carregar o arquivo. Toque em Tentar novamente.')
    }
  }, [previewMedia, retry])
  const mediaUrl = previewMedia ? previewMedia[asset.id] : url
  useEffect(() => {
    if (!mediaUrl || (ready && !buffering) || error) return
    const slowTimer = setTimeout(() => setWaitingLonger(true), 8000)
    const timeout = setTimeout(loadError, 45000)
    return () => {
      clearTimeout(slowTimer)
      clearTimeout(timeout)
    }
  }, [mediaUrl, ready, buffering, error, loadError])
  useEffect(() => {
    if (mediaUrl || error || previewMedia) return
    const timer = setTimeout(() => setWaitingLonger(true), 8000)
    return () => clearTimeout(timer)
  }, [mediaUrl, error, previewMedia])
  useEffect(() => {
    const video = videoRef.current
    const audio = audioRef.current
    const pauseOther = (event: Event) => {
      const playing = (event as CustomEvent).detail
      if (playing !== audio) audio?.pause()
      if (playing !== video) video?.pause()
    }
    window.addEventListener('music-library-play', pauseOther)
    // Browsers may require another tap after the authenticated URL is loaded.
    const media = audio ?? video
    if (autoPlay && media && !restoring.current) tryPlay(media)
    return () => {
      window.removeEventListener('music-library-play', pauseOther)
      video?.pause()
      audio?.pause()
    }
  }, [url, previewMedia, autoPlay, tryPlay])
  useEffect(() => {
    currentToken.current = token
  }, [token])
  useEffect(() => {
    if (previewMedia) return
    const controller = new AbortController()
    mediaAccessUrl(asset.id, () => currentToken.current, controller.signal, refresh > 0)
      .then((result) => {
        if (!controller.signal.aborted) {
          retrying.current = false
          setUrl(result)
        }
      })
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) {
          retrying.current = false
          setError(reason instanceof Error ? reason.message : 'Não foi possível abrir o arquivo.')
        }
      })
    return () => controller.abort()
  }, [asset.id, refresh, previewMedia])
  function metadataLoaded(media: HTMLMediaElement) {
    loaded()
    const restore = restoring.current
    restoring.current = null
    if (restore) {
      if (Number.isFinite(media.duration) && restore.time < media.duration)
        media.currentTime = restore.time
      if (restore.playing) tryPlay(media)
    }
  }
  if (previewMedia && !mediaUrl)
    return (
      <div className="public-library-preview-locked">
        <BookOpen size={22} />
        <p>Este {asset.kind === 'audio' ? 'áudio' : 'material'} está na área do aluno.</p>
        <span>
          {asset.kind === 'video'
            ? 'As partituras guiadas fazem parte do Plano Completo.'
            : asset.kind === 'audio'
              ? 'Os áudios fazem parte do Plano Completo.'
              : 'As partituras estão incluídas nos dois planos.'}{' '}
          {asset.kind === 'video'
            ? 'Entre na sua biblioteca para assistir.'
            : 'Para experimentar agora, abra A Thousand Years nesta demonstração.'}
        </span>
        <a href="#planos">Conhecer os planos ↗</a>
      </div>
    )
  return (
    <div className="repertoire-media" aria-busy={!ready && !error}>
      {error ? (
        <p role="alert" className="checkout-error">
          {error}
        </p>
      ) : !mediaUrl ? (
        <p className="repertoire-loading" role="status">
          <LoaderCircle className="checkout-spinner" size={18} />{' '}
          {refresh > 0 ? 'Tentando abrir novamente…' : 'Abrindo arquivo…'}
        </p>
      ) : asset.kind === 'audio' ? (
        <audio
          ref={audioRef}
          controls
          preload="metadata"
          src={mediaUrl}
          aria-label={asset.title}
          onError={loadError}
          onLoadedMetadata={(event) => metadataLoaded(event.currentTarget)}
          onWaiting={() => setBuffering(true)}
          onStalled={(event) => {
            if (!event.currentTarget.paused) setBuffering(true)
          }}
          onCanPlay={() => setBuffering(false)}
          onPlaying={() => setBuffering(false)}
          onPause={(event) => {
            setBuffering(false)
            if (!retrying.current && !event.currentTarget.error) playIntent.current = false
          }}
          onPlay={(event) => {
            playIntent.current = true
            setNeedsPlay(false)
            window.dispatchEvent(
              new CustomEvent('music-library-play', { detail: event.currentTarget }),
            )
          }}
        />
      ) : asset.kind === 'video' ? (
        <video
          ref={videoRef}
          controls
          playsInline
          preload="metadata"
          src={mediaUrl}
          aria-label={asset.title}
          onError={loadError}
          onLoadedMetadata={(event) => metadataLoaded(event.currentTarget)}
          onWaiting={() => setBuffering(true)}
          onStalled={(event) => {
            if (!event.currentTarget.paused) setBuffering(true)
          }}
          onCanPlay={() => setBuffering(false)}
          onPlaying={() => setBuffering(false)}
          onPause={(event) => {
            setBuffering(false)
            if (!retrying.current && !event.currentTarget.error) playIntent.current = false
          }}
          onPlay={(event) => {
            playIntent.current = true
            setNeedsPlay(false)
            window.dispatchEvent(
              new CustomEvent('music-library-play', { detail: event.currentTarget }),
            )
          }}
        />
      ) : asset.format === 'png' ? (
        <div className="repertoire-image">
          <img src={mediaUrl} alt={asset.title} onError={loadError} onLoad={loaded} />
        </div>
      ) : (
        <Suspense fallback={<p role="status">Preparando partitura…</p>}>
          <ScorePdf
            key={`${mediaUrl}:${refresh}`}
            url={mediaUrl}
            title={asset.title}
            onError={loadError}
            onLoad={loaded}
          />
        </Suspense>
      )}
      {needsPlay && !error && mediaUrl && (
        <p className="repertoire-media-notice">
          Toque em reproduzir para iniciar {asset.kind === 'video' ? 'o vídeo' : 'o áudio'}.
        </p>
      )}
      {waitingLonger && !error && (
        <p role="status" className="repertoire-media-notice">
          O carregamento está demorando. Aguarde ou tente novamente.
        </p>
      )}
      {!previewMedia && (!minimal || error || waitingLonger) && (
        <div className="repertoire-media-footer">
          <button onClick={() => retry()}>
            <RefreshCw size={14} />{' '}
            {error || waitingLonger ? 'Tentar novamente' : 'Renovar acesso ao arquivo'}
          </button>
          {url && !error && asset.kind === 'score' && (
            <a href={url} target="_blank" rel="noreferrer">
              Abrir partitura em nova aba ↗
            </a>
          )}
        </div>
      )}
    </div>
  )
}
