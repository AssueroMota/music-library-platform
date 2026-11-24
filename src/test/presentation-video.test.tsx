import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { PresentationVideo } from '../components/PresentationVideo'
import { VisitPlaylist } from '../components/VisitPlaylist'

let enter: (ratio: number) => void
let playing: WeakSet<HTMLMediaElement>
const disconnect = vi.fn()
const source = '/videos/music-library-agorassss.mp4'

beforeEach(() => {
  playing = new WeakSet()
  sessionStorage.clear()
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      constructor(callback: IntersectionObserverCallback) {
        enter = (ratio) =>
          callback(
            [{ isIntersecting: ratio > 0, intersectionRatio: ratio } as IntersectionObserverEntry],
            this as unknown as IntersectionObserver,
          )
      }
      observe() {}
      disconnect = disconnect
    },
  )
  vi.spyOn(HTMLMediaElement.prototype, 'paused', 'get').mockImplementation(function (
    this: HTMLMediaElement,
  ) {
    return !playing.has(this)
  })
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(async function (
    this: HTMLMediaElement,
  ) {
    playing.add(this)
    this.dispatchEvent(new Event('play'))
  })
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(function (
    this: HTMLMediaElement,
  ) {
    playing.delete(this)
    this.dispatchEvent(new Event('pause'))
  })
  disconnect.mockClear()
})
afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

const player = <PresentationVideo src={source} poster="/videos/music-library-hero-poster.webp" />
const start = () => screen.getByRole('link', { name: 'Assistir à apresentação' })

it('carrega e reproduz com som quando o vídeo entra na área visível', () => {
  const { container } = render(player)
  const video = container.querySelector('video')!
  expect(video).toHaveAttribute('preload', 'none')
  expect(video).toHaveAttribute('poster', '/videos/music-library-hero-poster.webp')
  expect(video).not.toHaveAttribute('src')
  expect(video).not.toHaveAttribute('autoplay')
  expect(video.controls).toBe(false)
  expect(start()).toHaveAttribute('href', source)
  act(() => enter(0.25))
  expect(video.play).not.toHaveBeenCalled()
  expect(video).not.toHaveAttribute('src')

  act(() => enter(0.8))
  expect(video).toHaveAttribute('src', source)
  expect(video.play).toHaveBeenCalledOnce()
  expect(video.controls).toBe(true)
  expect(video.muted).toBe(false)
})

it('toca sem som e oferece um botão quando o navegador bloqueia o áudio automático', async () => {
  vi.mocked(HTMLMediaElement.prototype.play).mockRejectedValueOnce(
    new DOMException('Playback requires interaction', 'NotAllowedError'),
  )
  const { container } = render(player)
  const video = container.querySelector('video')!
  await act(async () => enter(1))
  expect(video.paused).toBe(false)
  expect(video.muted).toBe(true)

  fireEvent.click(screen.getByRole('button', { name: 'Ativar som' }))
  expect(video.muted).toBe(false)
  expect(video).toHaveFocus()
  expect(video.play).toHaveBeenCalledTimes(2)
})

it('pausa ao sair da área e retoma do mesmo ponto ao voltar', () => {
  const { container } = render(player)
  const video = container.querySelector('video')!
  act(() => enter(1))
  video.currentTime = 12
  act(() => enter(0.25))
  expect(video.paused).toBe(true)
  expect(video.currentTime).toBe(12)
  act(() => enter(1))
  expect(video.play).toHaveBeenCalledTimes(2)
  expect(video.paused).toBe(false)
  expect(video.currentTime).toBe(12)
})

it('respeita a pausa manual ao sair da área e voltar', () => {
  const { container } = render(player)
  const video = container.querySelector('video')!
  act(() => enter(1))
  act(() => video.pause())
  act(() => enter(0))
  act(() => enter(1))
  expect(video.paused).toBe(true)
  expect(video.play).toHaveBeenCalledOnce()
})

it('pausa em outra aba e retoma ao retornar com o vídeo visível', () => {
  const visibility = vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible')
  const { container } = render(player)
  const video = container.querySelector('video')!
  act(() => enter(1))
  visibility.mockReturnValue('hidden')
  fireEvent(document, new Event('visibilitychange'))
  expect(video.paused).toBe(true)
  visibility.mockReturnValue('visible')
  fireEvent(document, new Event('visibilitychange'))
  expect(video.play).toHaveBeenCalledTimes(2)
  expect(video.paused).toBe(false)
})

it('mantém o play manual disponível se o navegador bloquear a reprodução automática', async () => {
  const blocked = new DOMException('Playback requires interaction', 'NotAllowedError')
  vi.mocked(HTMLMediaElement.prototype.play)
    .mockRejectedValueOnce(blocked)
    .mockRejectedValueOnce(blocked)
  const { container } = render(player)
  const video = container.querySelector('video')!
  await act(async () => enter(1))
  expect(screen.queryByRole('alert')).toBeNull()

  fireEvent.click(start())
  expect(video.paused).toBe(false)
  expect(video.muted).toBe(false)
  expect(video).toHaveFocus()
})

it('oferece nova tentativa e um link direto quando a reprodução falha', async () => {
  vi.mocked(HTMLMediaElement.prototype.play).mockRejectedValueOnce(
    new DOMException('Playback failed', 'NotSupportedError'),
  )
  const { container } = render(player)
  act(() => enter(1))
  const retry = await screen.findByRole('link', { name: 'Tentar reproduzir' })
  expect(screen.getByRole('alert')).toHaveTextContent('O vídeo falhou ao carregar.')
  expect(screen.getByRole('link', { name: 'Abrir o arquivo de vídeo' })).toHaveAttribute(
    'href',
    source,
  )
  fireEvent.click(retry)
  expect(container.querySelector('video')!.controls).toBe(true)
  expect(screen.queryByRole('alert')).toBeNull()
})

it('coordena o áudio com a playlist da visita e desliga o observador ao desmontar', async () => {
  const { container, unmount } = render(
    <>
      {player}
      <VisitPlaylist />
    </>,
  )
  await screen.findByRole('button', { name: 'Pausar música da visita' })
  act(() => enter(1))
  expect(screen.getByRole('button', { name: 'Reproduzir música da visita' })).toBeInTheDocument()
  const video = container.querySelector('video')!
  expect(video.paused).toBe(false)
  const playlistAudio = container.querySelector('audio')!
  await act(async () => playlistAudio.play())
  expect(playlistAudio.paused).toBe(true)
  expect(video.paused).toBe(false)

  fireEvent.click(screen.getByRole('button', { name: 'Reproduzir música da visita' }))
  expect(playlistAudio.paused).toBe(false)
  expect(video.paused).toBe(true)
  act(() => enter(0))
  act(() => enter(1))
  expect(video.paused).toBe(true)
  unmount()
  expect(disconnect).toHaveBeenCalled()
})
