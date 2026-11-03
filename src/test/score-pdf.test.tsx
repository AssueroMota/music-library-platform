import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, it, vi } from 'vitest'
import { MemberRepertoire } from '../components/MemberRepertoire'
import type { MemberLibraryData } from '../../shared/library'

const pdf = vi.hoisted(() => ({
  getPage: vi.fn(async () => ({
    getViewport: ({ scale }: { scale: number }) => ({ width: 600 * scale, height: 800 * scale }),
    render: () => ({ promise: Promise.resolve(), cancel: vi.fn() }),
  })),
  destroy: vi.fn(),
}))
vi.mock('pdfjs-dist', () => ({
  GlobalWorkerOptions: {},
  getDocument: () => ({
    promise: Promise.resolve({ numPages: 3, getPage: pdf.getPage }),
    destroy: pdf.destroy,
  }),
}))

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

it('troca as três páginas por botões, teclado e gesto sem reiniciar ou pausar o áudio', async () => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      callback: (entries: unknown[]) => void
      constructor(callback: (entries: unknown[]) => void) {
        this.callback = callback
      }
      observe() {
        this.callback([{ contentRect: { width: 700, height: 600 } }])
      }
      disconnect() {}
    },
  )
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
    {} as CanvasRenderingContext2D,
  )
  const play = vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue()
  const pause = vi.spyOn(HTMLMediaElement.prototype, 'pause')
  const base = {
    songTitle: '93 Million Miles',
    artist: 'Jason Mraz',
    instrument: 'violin',
    style: 'Pop internacional',
  }
  const data: MemberLibraryData = {
    setlistLimit: 42,
    products: [],
    assets: [
      { ...base, id: 'score', title: '93 Million Miles', kind: 'score', format: 'pdf' },
      { ...base, id: 'audio', title: '93 Million Miles - Áudio', kind: 'audio', format: 'mp3' },
    ],
  }
  render(
    <MemberRepertoire
      data={data}
      token=""
      previewMedia={{ score: '/test.pdf', audio: '/test.mp3' }}
    />,
  )
  const user = userEvent.setup()
  await user.click(screen.getByRole('button', { name: 'Ver partitura de 93 Million Miles' }))
  await screen.findByText('Página 1 de 3')
  const audio = document.querySelector('audio')!
  audio.currentTime = 53
  const playCount = play.mock.calls.length
  const pauseCount = pause.mock.calls.length
  expect(screen.getByRole('button', { name: 'Página anterior' })).toBeDisabled()
  const viewport = screen.getByRole('region', { name: /Use as setas/ })
  viewport.scrollTop = 300
  await user.click(screen.getByRole('button', { name: 'Próxima página' }))
  expect(screen.getByText('Página 2 de 3')).toBeInTheDocument()
  expect(viewport.scrollTop).toBe(0)
  fireEvent.keyDown(viewport, { key: 'ArrowRight' })
  expect(screen.getByText('Página 3 de 3')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Próxima página' })).toBeDisabled()
  fireEvent.touchStart(viewport, { touches: [{ clientX: 50, clientY: 100 }] })
  fireEvent.touchEnd(viewport, { changedTouches: [{ clientX: 180, clientY: 110 }], touches: [] })
  expect(screen.getByText('Página 2 de 3')).toBeInTheDocument()
  // Vertical scrolling must never change pages.
  fireEvent.touchStart(viewport, { touches: [{ clientX: 50, clientY: 100 }] })
  fireEvent.touchEnd(viewport, { changedTouches: [{ clientX: 55, clientY: 250 }], touches: [] })
  expect(screen.getByText('Página 2 de 3')).toBeInTheDocument()
  await waitFor(() => expect(pdf.getPage).toHaveBeenLastCalledWith(2))
  await waitFor(() =>
    expect(screen.getByRole('img', { name: '93 Million Miles — página 2' })).toHaveStyle({
      height: '600px',
      width: '450px',
    }),
  )
  expect(document.querySelector('audio')).toBe(audio)
  expect(audio.currentTime).toBe(53)
  expect(play).toHaveBeenCalledTimes(playCount)
  expect(pause).toHaveBeenCalledTimes(pauseCount)
})
