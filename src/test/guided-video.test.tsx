import { createRef } from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, it, vi } from 'vitest'
import { GuidedVideo } from '../components/GuidedVideo'

afterEach(() => vi.restoreAllMocks())

it('mantém progresso e tempo restante disponíveis durante a reprodução e permite buscar e repetir', async () => {
  const videoRef = createRef<HTMLVideoElement>()
  render(<GuidedVideo videoRef={videoRef} src="/guided.mp4" />)
  const video = videoRef.current!
  Object.defineProperty(video, 'duration', { configurable: true, value: 245 })
  Object.defineProperty(video, 'paused', { configurable: true, value: false })
  fireEvent.loadedMetadata(video)
  video.currentTime = 230
  fireEvent.timeUpdate(video)
  fireEvent.play(video)
  expect(screen.getByLabelText('Tempo do vídeo')).toHaveTextContent('3:50 / 4:05')
  expect(screen.getByText('Faltam 0:15')).toBeVisible()
  expect(screen.getByRole('button', { name: 'Pausar vídeo' })).toBeVisible()
  const progress = screen.getByRole('slider', { name: 'Progresso do vídeo' })
  fireEvent.change(progress, { target: { value: '120' } })
  expect(video.currentTime).toBe(120)
  expect(progress).toHaveAttribute('aria-valuetext', '2:00 de 4:05')
  video.currentTime = 245
  Object.defineProperty(video, 'ended', { configurable: true, value: true })
  Object.defineProperty(video, 'paused', { configurable: true, value: true })
  fireEvent.ended(video)
  expect(screen.getByText('Faltam 0:00')).toBeVisible()
  vi.spyOn(video, 'play').mockResolvedValue()
  await userEvent.click(screen.getByRole('button', { name: 'Reproduzir vídeo' }))
  expect(video.currentTime).toBe(0)
  expect(video.play).toHaveBeenCalledOnce()
})

it('inclui a barra de controles na tela cheia e preserva volume e velocidade', async () => {
  const videoRef = createRef<HTMLVideoElement>()
  const { container } = render(<GuidedVideo videoRef={videoRef} src="/guided.mp4" />)
  const player = container.querySelector('.guided-video-player')!
  const requestFullscreen = vi.fn(async () => {
    Object.defineProperty(document, 'fullscreenElement', { configurable: true, value: player })
    document.dispatchEvent(new Event('fullscreenchange'))
  })
  Object.defineProperty(player, 'requestFullscreen', {
    configurable: true,
    value: requestFullscreen,
  })
  const exitFullscreen = vi.fn(async () => {
    Object.defineProperty(document, 'fullscreenElement', { configurable: true, value: null })
    document.dispatchEvent(new Event('fullscreenchange'))
  })
  Object.defineProperty(document, 'exitFullscreen', { configurable: true, value: exitFullscreen })
  const user = userEvent.setup()
  await user.click(screen.getByRole('button', { name: 'Tela cheia' }))
  expect(requestFullscreen).toHaveBeenCalledOnce()
  expect(player).toContainElement(screen.getByRole('slider', { name: 'Progresso do vídeo' }))
  await user.selectOptions(screen.getByRole('combobox', { name: 'Velocidade do vídeo' }), '0.75')
  expect(videoRef.current!.playbackRate).toBe(0.75)
  fireEvent.change(screen.getByRole('slider', { name: 'Volume do vídeo' }), {
    target: { value: '0.5' },
  })
  expect(videoRef.current!.volume).toBe(0.5)
  await user.click(screen.getByRole('button', { name: 'Silenciar vídeo' }))
  expect(videoRef.current!.muted).toBe(true)
  await user.click(screen.getByRole('button', { name: 'Sair da tela cheia' }))
  await waitFor(() => expect(exitFullscreen).toHaveBeenCalledOnce())
  expect(screen.getByRole('button', { name: 'Tela cheia' })).toBeVisible()
})

it('oferece visualização ampliada quando o navegador não permite tela cheia', async () => {
  const videoRef = createRef<HTMLVideoElement>()
  const { container } = render(<GuidedVideo videoRef={videoRef} src="/guided.mp4" />)
  await userEvent.click(screen.getByRole('button', { name: 'Tela cheia' }))
  expect(container.querySelector('.guided-video-player')).toHaveClass('is-expanded')
  expect(screen.getByRole('group', { name: 'Controles do vídeo' })).toBeVisible()
  await userEvent.click(screen.getByRole('button', { name: 'Sair da tela cheia' }))
  expect(container.querySelector('.guided-video-player')).not.toHaveClass('is-expanded')
})
