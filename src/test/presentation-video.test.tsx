import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { PresentationVideo } from '../components/PresentationVideo'
import { VisitPlaylist } from '../components/VisitPlaylist'

let enter: (visible: boolean) => void
const disconnect = vi.fn()
beforeEach(() => {
  sessionStorage.clear()
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      target?: Element
      constructor(callback: IntersectionObserverCallback) {
        enter = (visible) =>
          callback(
            [
              {
                target: this.target,
                isIntersecting: visible,
                intersectionRatio: visible ? 0.75 : 0,
              } as IntersectionObserverEntry,
            ],
            this as unknown as IntersectionObserver,
          )
      }
      observe = (target: Element) => {
        this.target = target
      }
      disconnect = disconnect
    },
  )
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(async function (
    this: HTMLMediaElement,
  ) {
    this.dispatchEvent(new Event('play'))
  })
  disconnect.mockClear()
})
afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})
const player = (
  <PresentationVideo
    src="/videos/music-library-agorassss.mp4"
    poster="/videos/music-library-agorassss.jpg"
  />
)

it('toca com áudio somente ao entrar na área e pausa ao sair, retomando do mesmo ponto', async () => {
  const { container } = render(player)
  const video = container.querySelector('video')!
  expect(video.querySelector('source')).toHaveAttribute(
    'src',
    '/videos/music-library-agorassss.mp4',
  )
  expect(video.muted).toBe(false)
  expect(video).not.toHaveAttribute('autoplay')
  expect(video.play).not.toHaveBeenCalled()
  await act(async () => enter(true))
  expect(video.play).toHaveBeenCalledTimes(1)
  video.currentTime = 12
  const paused = vi.mocked(video.pause).mock.calls.length
  act(() => enter(false))
  expect(video.pause).toHaveBeenCalledTimes(paused + 1)
  expect(video.currentTime).toBe(12)
  await act(async () => enter(true))
  expect(video.play).toHaveBeenCalledTimes(2)
  expect(video.currentTime).toBe(12)
})

it('oferece play com som quando o navegador bloqueia autoplay, sem silenciar o vídeo', async () => {
  vi.mocked(HTMLMediaElement.prototype.play).mockRejectedValueOnce(
    new DOMException('Blocked', 'NotAllowedError'),
  )
  const { container } = render(player)
  await act(async () => enter(true))
  const button = await screen.findByRole('button', { name: 'Assistir com som' })
  expect(container.querySelector('video')!.muted).toBe(false)
  fireEvent.click(button)
  await waitFor(() => expect(screen.queryByRole('button', { name: 'Assistir com som' })).toBeNull())
  expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(2)
})

it('não tenta reproduzir por interação fora da área nem retoma depois de uma pausa manual', async () => {
  vi.mocked(HTMLMediaElement.prototype.play).mockRejectedValueOnce(
    new DOMException('Blocked', 'NotAllowedError'),
  )
  const { container } = render(player)
  await act(async () => enter(true))
  act(() => enter(false))
  fireEvent.click(document.body)
  expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(1)
  await act(async () => enter(true))
  fireEvent.pause(container.querySelector('video')!)
  await act(async () => enter(true))
  fireEvent.click(document.body)
  expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(2)
})

it('cancela reprodução pendente ao sair e não deixa o áudio começar depois de carregar', async () => {
  let resolvePlay!: () => void
  vi.mocked(HTMLMediaElement.prototype.play).mockImplementationOnce(
    () =>
      new Promise<void>((resolve) => {
        resolvePlay = resolve
      }),
  )
  const { container } = render(player)
  const video = container.querySelector('video')!
  act(() => enter(true))
  act(() => enter(false))
  const paused = vi.mocked(video.pause).mock.calls.length
  await act(async () => resolvePlay())
  expect(video.pause).toHaveBeenCalledTimes(paused + 1)
  expect(screen.queryByRole('button', { name: 'Assistir com som' })).toBeNull()
})

it('pausa ao esconder a aba e só retoma se o visitante não pausou manualmente', async () => {
  const visibility = vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible')
  const { container } = render(player)
  const video = container.querySelector('video')!
  await act(async () => enter(true))
  visibility.mockReturnValue('hidden')
  fireEvent(document, new Event('visibilitychange'))
  visibility.mockReturnValue('visible')
  await act(async () => fireEvent(document, new Event('visibilitychange')))
  expect(video.play).toHaveBeenCalledTimes(2)
  fireEvent.pause(video)
  visibility.mockReturnValue('hidden')
  fireEvent(document, new Event('visibilitychange'))
  visibility.mockReturnValue('visible')
  await act(async () => fireEvent(document, new Event('visibilitychange')))
  expect(video.play).toHaveBeenCalledTimes(2)
})

it('coordena o áudio com a playlist da visita e libera o observador ao desmontar', async () => {
  const { container, unmount } = render(
    <>
      {player}
      <VisitPlaylist />
    </>,
  )
  await screen.findByRole('button', { name: 'Pausar música da visita' })
  await act(async () => enter(true))
  expect(screen.getByRole('button', { name: 'Reproduzir música da visita' })).toBeInTheDocument()
  const video = container.querySelector('video')!
  const paused = vi.mocked(video.pause).mock.contexts.filter((media) => media === video).length
  window.dispatchEvent(
    new CustomEvent('music-library-play', { detail: container.querySelector('audio') }),
  )
  expect(
    vi.mocked(video.pause).mock.contexts.filter((media) => media === video).length,
  ).toBeGreaterThan(paused)
  unmount()
  expect(disconnect).toHaveBeenCalled()
})
