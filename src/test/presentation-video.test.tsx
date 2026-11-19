import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { PresentationVideo } from '../components/PresentationVideo'
import { VisitPlaylist } from '../components/VisitPlaylist'

let enter: (visible: boolean) => void
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
        enter = (visible) =>
          callback(
            [{ isIntersecting: visible } as IntersectionObserverEntry],
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

it('reserva a capa e oferece um link para o vídeo sem carregar o MP4 antes do play', async () => {
  const { container } = render(player)
  const video = container.querySelector('video')!
  expect(video).toHaveAttribute('preload', 'none')
  expect(video).toHaveAttribute('poster', '/videos/music-library-hero-poster.webp')
  expect(video).not.toHaveAttribute('src')
  expect(video).not.toHaveAttribute('autoplay')
  expect(video.controls).toBe(false)
  expect(start()).toHaveAttribute('href', source)
  act(() => enter(true))
  fireEvent.click(document.body)
  fireEvent.keyDown(document.body, { key: 'Enter' })
  expect(video.play).not.toHaveBeenCalled()
  expect(video).not.toHaveAttribute('src')

  fireEvent.click(start())
  await waitFor(() => expect(video).toHaveAttribute('src', source))
  expect(video.play).toHaveBeenCalledOnce()
  expect(video.controls).toBe(true)
  expect(video.muted).toBe(false)
  expect(video).toHaveFocus()
})

it('pausa ao sair da área e segue pausado ao voltar, mantendo a posição', () => {
  const { container } = render(player)
  const video = container.querySelector('video')!
  fireEvent.click(start())
  video.currentTime = 12
  act(() => enter(false))
  expect(video.paused).toBe(true)
  expect(video.currentTime).toBe(12)
  act(() => enter(true))
  expect(video.play).toHaveBeenCalledOnce()
})

it('pausa quando a aba é ocultada e deixa a retomada a cargo do visitante', () => {
  const visibility = vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible')
  const { container } = render(player)
  const video = container.querySelector('video')!
  fireEvent.click(start())
  visibility.mockReturnValue('hidden')
  fireEvent(document, new Event('visibilitychange'))
  expect(video.paused).toBe(true)
  visibility.mockReturnValue('visible')
  fireEvent(document, new Event('visibilitychange'))
  expect(video.play).toHaveBeenCalledOnce()
})

it('oferece nova tentativa e um link direto quando a reprodução falha', async () => {
  vi.mocked(HTMLMediaElement.prototype.play).mockRejectedValueOnce(
    new DOMException('Playback failed', 'NotSupportedError'),
  )
  const { container } = render(player)
  fireEvent.click(start())
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
  fireEvent.click(start())
  expect(screen.getByRole('button', { name: 'Reproduzir música da visita' })).toBeInTheDocument()
  const video = container.querySelector('video')!
  expect(video.paused).toBe(false)
  window.dispatchEvent(
    new CustomEvent('music-library-play', { detail: container.querySelector('audio') }),
  )
  expect(video.paused).toBe(true)
  unmount()
  expect(disconnect).toHaveBeenCalled()
})
