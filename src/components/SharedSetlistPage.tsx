import { useEffect, useRef, useState } from 'react'
import { Play, SkipBack, SkipForward } from 'lucide-react'
import type { SharedSetlist } from '../../shared/setlist-share'
import { api, LIBRARY_REQUEST_TIMEOUT_MS } from '../lib/api'
import '../styles/shared-setlist.css'

const shareToken = new URLSearchParams(window.location.hash.slice(1)).get('acesso')
const shareHeaders = { Authorization: `Bearer ${shareToken ?? ''}` }

function TrackPlayer({
  track,
  onEnded,
}: {
  track: SharedSetlist['tracks'][number]
  onEnded: () => void
}) {
  const audio = useRef<HTMLAudioElement>(null)
  const [url, setUrl] = useState(track.playback?.kind === 'reference' ? track.playback.path : '')
  const [failed, setFailed] = useState(false)
  const [retry, setRetry] = useState(0)

  useEffect(() => {
    if (track.playback?.kind !== 'library') return
    const controller = new AbortController()
    api<{ url: string }>(
      `/shared-setlist/tracks/${track.id}`,
      { headers: shareHeaders, signal: controller.signal },
      LIBRARY_REQUEST_TIMEOUT_MS,
    )
      .then((response) => {
        if (!controller.signal.aborted) setUrl(response.url)
      })
      .catch(() => {
        if (!controller.signal.aborted) setFailed(true)
      })
    return () => controller.abort()
  }, [retry, track])

  useEffect(() => {
    if (url) void audio.current?.play().catch(() => {})
  }, [url])

  if (track.playback?.kind === 'video') {
    const { videoId } = track.playback
    return (
      <>
        <iframe
          className="shared-setlist-video"
          title={track.title}
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`}
          referrerPolicy="strict-origin-when-cross-origin"
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
        />
        <a
          className="shared-setlist-external"
          href={`https://www.youtube.com/watch?v=${videoId}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Ver referência no YouTube
        </a>
      </>
    )
  }

  if (failed) {
    return (
      <div className="shared-setlist-error">
        <p role="alert">Não foi possível tocar esta faixa.</p>
        <button
          type="button"
          onClick={() => {
            setFailed(false)
            if (track.playback?.kind === 'library') setUrl('')
            setRetry((value) => value + 1)
          }}
        >
          Tentar novamente
        </button>
      </div>
    )
  }

  return url ? (
    <audio
      key={retry}
      ref={audio}
      src={url}
      controls
      autoPlay
      preload="metadata"
      controlsList="nodownload"
      aria-label={track.title}
      onEnded={onEnded}
      onError={() => setFailed(true)}
    />
  ) : (
    <p role="status">Carregando faixa…</p>
  )
}

export function SharedSetlistPage() {
  const [playlist, setPlaylist] = useState<SharedSetlist | null>(null)
  const [failed, setFailed] = useState(!shareToken)
  const [retry, setRetry] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  useEffect(() => {
    if (!shareToken) return
    const controller = new AbortController()
    api<SharedSetlist>(
      '/shared-setlist',
      { headers: shareHeaders, signal: controller.signal },
      LIBRARY_REQUEST_TIMEOUT_MS,
    )
      .then((result) => {
        if (!controller.signal.aborted) setPlaylist(result)
      })
      .catch(() => {
        if (!controller.signal.aborted) setFailed(true)
      })
    return () => controller.abort()
  }, [retry])

  const track = selected === null ? null : playlist?.tracks[selected]
  const previous =
    selected === null
      ? -1
      : (playlist?.tracks.findLastIndex(
          (item, index) => index < selected && Boolean(item.playback),
        ) ?? -1)
  const next =
    selected === null
      ? -1
      : (playlist?.tracks.findIndex((item, index) => index > selected && Boolean(item.playback)) ??
        -1)

  return (
    <main className="shared-setlist-page">
      <img
        src="/images/music-library-violinista-transparent.png"
        alt="Music Library"
        width={58}
        height={58}
      />
      <h1>{playlist?.title ?? 'Playlist compartilhada'}</h1>
      {failed ? (
        <div className="shared-setlist-error">
          <p role="alert">Este link não está disponível ou expirou.</p>
          {shareToken && (
            <button
              type="button"
              onClick={() => {
                setFailed(false)
                setRetry((value) => value + 1)
              }}
            >
              Tentar novamente
            </button>
          )}
        </div>
      ) : playlist ? (
        <>
          {track && (
            <section className="shared-setlist-player" aria-label="Player da playlist">
              <h2>{track.title}</h2>
              <TrackPlayer
                key={track.id}
                track={track}
                onEnded={() => {
                  if (next !== -1) setSelected(next)
                }}
              />
              <div className="shared-setlist-transport">
                <button
                  type="button"
                  disabled={previous === -1}
                  onClick={() => setSelected(previous)}
                >
                  <SkipBack size={17} aria-hidden="true" /> Anterior
                </button>
                <button type="button" disabled={next === -1} onClick={() => setSelected(next)}>
                  Próxima <SkipForward size={17} aria-hidden="true" />
                </button>
              </div>
            </section>
          )}
          <ol className="shared-setlist-tracks">
            {playlist.tracks.map((item, index) => (
              <li key={item.id}>
                <button
                  type="button"
                  disabled={!item.playback}
                  aria-current={selected === index ? 'true' : undefined}
                  onClick={() => setSelected(index)}
                >
                  <span className="shared-setlist-number">{index + 1}</span>
                  <span>
                    <strong>{item.title}</strong>
                    {item.artist && <small>{item.artist}</small>}
                  </span>
                  {item.playback?.kind !== 'library' && (
                    <small>{item.playback ? 'Referência' : 'Sem áudio'}</small>
                  )}
                  <Play size={17} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ol>
        </>
      ) : (
        <p role="status">Carregando playlist…</p>
      )}
    </main>
  )
}
