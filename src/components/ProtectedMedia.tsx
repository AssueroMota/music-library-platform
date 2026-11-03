import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { BookOpen, LoaderCircle, RefreshCw } from 'lucide-react'
import type { MemberAsset } from '../../shared/library'
import { api, LIBRARY_REQUEST_TIMEOUT_MS } from '../lib/api'
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
    if (autoPlay && audio) void audio.play().catch(() => {})
    return () => {
      window.removeEventListener('music-library-play', pauseOther)
      video?.pause()
      audio?.pause()
    }
  }, [url, previewMedia, autoPlay])
  useEffect(() => {
    currentToken.current = token
  }, [token])
  useEffect(() => {
    if (previewMedia) return
    const controller = new AbortController()
    api<{ url: string }>(
      `/library/assets/${asset.id}/view`,
      {
        headers: { Authorization: `Bearer ${currentToken.current}` },
        signal: controller.signal,
      },
      LIBRARY_REQUEST_TIMEOUT_MS,
    )
      .then((result) => {
        if (!controller.signal.aborted) setUrl(result.url)
      })
      .catch((reason: unknown) => {
        if (!controller.signal.aborted)
          setError(reason instanceof Error ? reason.message : 'Não foi possível abrir o arquivo.')
      })
    return () => controller.abort()
  }, [asset.id, refresh, previewMedia])
  const loadError = useCallback(
    () => setError('Não foi possível carregar o arquivo. Renove o acesso e tente novamente.'),
    [],
  )
  const mediaUrl = previewMedia ? previewMedia[asset.id] : url
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
    <div className="repertoire-media">
      {error ? (
        <p role="alert" className="checkout-error">
          {error}
        </p>
      ) : !mediaUrl ? (
        <p className="repertoire-loading" role="status">
          <LoaderCircle className="checkout-spinner" size={18} /> Abrindo arquivo…
        </p>
      ) : asset.kind === 'audio' ? (
        <audio
          ref={audioRef}
          controls
          preload="metadata"
          src={mediaUrl}
          aria-label={asset.title}
          onError={loadError}
          onPlay={(event) =>
            window.dispatchEvent(
              new CustomEvent('music-library-play', { detail: event.currentTarget }),
            )
          }
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
          onPlay={(event) =>
            window.dispatchEvent(
              new CustomEvent('music-library-play', { detail: event.currentTarget }),
            )
          }
        />
      ) : asset.format === 'png' ? (
        <div className="repertoire-image">
          <img src={mediaUrl} alt={asset.title} onError={loadError} />
        </div>
      ) : (
        <Suspense fallback={<p role="status">Preparando partitura…</p>}>
          <ScorePdf key={mediaUrl} url={mediaUrl} title={asset.title} onError={loadError} />
        </Suspense>
      )}
      {!previewMedia && (!minimal || error) && (
        <div className="repertoire-media-footer">
          <button
            onClick={() => {
              setUrl('')
              setError('')
              setRefresh((value) => value + 1)
            }}
          >
            <RefreshCw size={14} /> {error ? 'Tentar novamente' : 'Renovar acesso ao arquivo'}
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
