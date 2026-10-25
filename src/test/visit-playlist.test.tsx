import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { VisitPlaylist } from '../components/VisitPlaylist'
import { AudioPlayer } from '../components/AudioPlayer'
import { visitPlaylist } from '../data/visit-playlist'

beforeEach(() => {
  sessionStorage.clear()
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(async function (
    this: HTMLMediaElement,
  ) {
    this.dispatchEvent(new Event('play'))
  })
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(function (
    this: HTMLMediaElement,
  ) {
    this.dispatchEvent(new Event('pause'))
  })
})
afterEach(() => vi.restoreAllMocks())

it('tenta iniciar em volume baixo e permite pausar, retomar e ajustar o volume', async () => {
  const { container } = render(<VisitPlaylist />)
  const audio = container.querySelector('audio')!
  await screen.findByRole('button', { name: 'Pausar música da visita' })
  expect(audio.getAttribute('src')).toBe(visitPlaylist[0].src)
  expect(audio.volume).toBe(0.2)
  fireEvent.change(screen.getByRole('slider', { name: 'Volume da música da visita' }), {
    target: { value: '8' },
  })
  expect(audio.volume).toBe(0.08)
  fireEvent.click(screen.getByRole('button', { name: 'Pausar música da visita' }))
  expect(screen.getByRole('button', { name: 'Reproduzir música da visita' })).toBeInTheDocument()
  expect(sessionStorage.getItem('ml:visit-music-paused')).toBe('true')
  fireEvent.click(screen.getByRole('button', { name: 'Reproduzir música da visita' }))
  await screen.findByRole('button', { name: 'Pausar música da visita' })
})

it('mostra um convite para ouvir quando o navegador bloqueia o início automático', async () => {
  vi.mocked(HTMLMediaElement.prototype.play).mockRejectedValueOnce(
    new DOMException('Blocked', 'NotAllowedError'),
  )
  render(<VisitPlaylist />)
  expect(await screen.findByRole('status')).toHaveTextContent('Toque no play para ouvir.')
  fireEvent.click(screen.getByRole('button', { name: 'Reproduzir música da visita' }))
  await screen.findByRole('button', { name: 'Pausar música da visita' })
})

it('respeita a pausa escolhida ao retornar à página na mesma sessão', () => {
  sessionStorage.setItem('ml:visit-music-paused', 'true')
  render(<VisitPlaylist />)
  expect(HTMLMediaElement.prototype.play).not.toHaveBeenCalled()
  expect(screen.getByRole('button', { name: 'Reproduzir música da visita' })).toBeInTheDocument()
})

it('minimiza e expande mantendo o áudio, a posição e o volume, sem interromper a reprodução', async () => {
  const { container } = render(<VisitPlaylist />)
  await screen.findByRole('button', { name: 'Pausar música da visita' })
  const audio = container.querySelector('audio')!
  audio.currentTime = 42
  fireEvent.change(screen.getByRole('slider', { name: 'Volume da música da visita' }), {
    target: { value: '8' },
  })
  const playCount = vi.mocked(HTMLMediaElement.prototype.play).mock.calls.length
  const pauseCount = vi.mocked(HTMLMediaElement.prototype.pause).mock.calls.length
  fireEvent.click(screen.getByRole('button', { name: 'Minimizar player de música' }))
  expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Pausar música da visita' })).toBeInTheDocument()
  expect(container.querySelector('audio')).toBe(audio)
  expect(audio.currentTime).toBe(42)
  expect(audio.volume).toBe(0.08)
  expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(playCount)
  expect(HTMLMediaElement.prototype.pause).toHaveBeenCalledTimes(pauseCount)
  expect(sessionStorage.getItem('ml:visit-music-minimized')).toBe('true')
  fireEvent.click(screen.getByRole('button', { name: 'Expandir player de música' }))
  expect(screen.getByRole('combobox')).toHaveValue('0')
  expect(screen.getByRole('slider', { name: 'Volume da música da visita' })).toHaveValue('8')
  expect(sessionStorage.getItem('ml:visit-music-minimized')).toBe('false')
})

it('mantém a escolha de minimizar na mesma sessão e permite controlar a música recolhida', async () => {
  sessionStorage.setItem('ml:visit-music-minimized', 'true')
  render(<VisitPlaylist />)
  expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
  await screen.findByRole('button', { name: 'Pausar música da visita' })
  fireEvent.click(screen.getByRole('button', { name: 'Pausar música da visita' }))
  expect(screen.getByRole('button', { name: 'Reproduzir música da visita' })).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Expandir player de música' }))
  expect(screen.getByRole('combobox')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Reproduzir música da visita' })).toBeInTheDocument()
})

it('avança ao terminar, permite escolher a última faixa e retorna à primeira', async () => {
  const { container } = render(<VisitPlaylist />)
  const audio = container.querySelector('audio')!
  fireEvent.ended(audio)
  await waitFor(() => expect(audio.getAttribute('src')).toBe(visitPlaylist[1].src))
  fireEvent.click(screen.getByRole('button', { name: 'Próxima música' }))
  expect(audio.getAttribute('src')).toBe(visitPlaylist[2].src)
  fireEvent.change(screen.getByRole('combobox', { name: 'Escolher música da visita' }), {
    target: { value: String(visitPlaylist.length - 1) },
  })
  expect(audio.getAttribute('src')).toBe(visitPlaylist.at(-1)!.src)
  fireEvent.ended(audio)
  expect(audio.getAttribute('src')).toBe(visitPlaylist[0].src)
  fireEvent.click(screen.getByRole('button', { name: 'Música anterior' }))
  expect(audio.getAttribute('src')).toBe(visitPlaylist.at(-1)!.src)
})

it('coordena a playlist e a demonstração para não reproduzir as duas juntas', async () => {
  const { container } = render(
    <>
      <VisitPlaylist />
      <AudioPlayer src="/demo.mp3" label="demonstração" />
    </>,
  )
  await screen.findByRole('button', { name: 'Pausar música da visita' })
  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: 'Reproduzir demonstração' }))
  })
  expect(screen.getByRole('button', { name: 'Reproduzir música da visita' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Pausar demonstração' })).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Reproduzir música da visita' }))
  await screen.findByRole('button', { name: 'Pausar música da visita' })
  expect(screen.getByRole('button', { name: 'Reproduzir demonstração' })).toBeInTheDocument()
  const video = document.createElement('video')
  container.append(video)
  fireEvent.play(video)
  expect(screen.getByRole('button', { name: 'Reproduzir música da visita' })).toBeInTheDocument()
})

it('permite trocar uma faixa indisponível sem repetir tentativas automaticamente', async () => {
  const { container } = render(<VisitPlaylist />)
  fireEvent.error(container.querySelector('audio')!)
  expect(screen.getByRole('status')).toHaveTextContent('Faixa indisponível')
  fireEvent.click(screen.getByRole('button', { name: 'Próxima música' }))
  await screen.findByRole('button', { name: 'Pausar música da visita' })
  expect(container.querySelector('audio')?.getAttribute('src')).toBe(visitPlaylist[1].src)
})
