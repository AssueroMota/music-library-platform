import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import type { MemberAsset } from '../../shared/library'
import { ProtectedMedia } from '../components/ProtectedMedia'
import { mediaAccessUrl } from '../lib/media-access'

const asset: MemberAsset = {
  id: 'audio',
  title: 'Acompanhamento',
  songTitle: 'Teste',
  artist: '',
  style: '',
  instrument: 'violin',
  kind: 'audio',
  format: 'mp3',
}
const link = (url = 'https://storage.example.test/audio.mp3') =>
  new Response(JSON.stringify({ url }))

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

it('repete a autorização uma vez após 503, usando a credencial mais recente', async () => {
  vi.useFakeTimers()
  const fetchMock = vi
    .fn()
    .mockResolvedValueOnce(new Response('<html>Starting</html>', { status: 503 }))
    .mockResolvedValueOnce(link())
  vi.stubGlobal('fetch', fetchMock)
  let token = 'old'
  const result = mediaAccessUrl('audio', () => token, new AbortController().signal)
  await vi.advanceTimersByTimeAsync(100)
  token = 'new'
  await vi.advanceTimersByTimeAsync(1000)
  expect(await result).toBe('https://storage.example.test/audio.mp3')
  expect(fetchMock).toHaveBeenCalledTimes(2)
  expect(fetchMock.mock.calls[1][1].headers.Authorization).toBe('Bearer new')
  expect(fetchMock.mock.calls[1][0]).toContain('/view?refresh=1')
})

it('não repete recusa de acesso e interrompe novas tentativas ao fechar o material', async () => {
  const fetchMock = vi.fn().mockResolvedValue(
    new Response(JSON.stringify({ code: 'ACCESS_DENIED', message: 'Sem acesso.' }), {
      status: 403,
    }),
  )
  vi.stubGlobal('fetch', fetchMock)
  await expect(
    mediaAccessUrl('audio', () => 'test', new AbortController().signal),
  ).rejects.toMatchObject({ code: 'ACCESS_DENIED' })
  expect(fetchMock).toHaveBeenCalledTimes(1)
  vi.useFakeTimers()
  fetchMock.mockReset().mockRejectedValue(new TypeError('Network failed'))
  const controller = new AbortController()
  const result = mediaAccessUrl('audio', () => 'test', controller.signal)
  const rejected = expect(result).rejects.toMatchObject({ name: 'AbortError' })
  await vi.advanceTimersByTimeAsync(100)
  controller.abort()
  await rejected
  await vi.advanceTimersByTimeAsync(2000)
  expect(fetchMock).toHaveBeenCalledTimes(1)
})

it('renova o arquivo após falha e restaura o tempo de reprodução', async () => {
  const fetchMock = vi
    .fn()
    .mockResolvedValueOnce(link('/first.mp3'))
    .mockResolvedValueOnce(link('/renewed.mp3'))
  vi.stubGlobal('fetch', fetchMock)
  const play = vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue()
  const { container } = render(<ProtectedMedia asset={asset} token="test" minimal autoPlay />)
  await waitFor(() => expect(container.querySelector('audio')).toHaveAttribute('src', '/first.mp3'))
  const first = container.querySelector('audio')!
  Object.defineProperty(first, 'paused', { configurable: true, value: false })
  first.currentTime = 72
  fireEvent.loadedMetadata(first)
  fireEvent.error(first)
  await waitFor(() =>
    expect(container.querySelector('audio')).toHaveAttribute('src', '/renewed.mp3'),
  )
  const renewed = container.querySelector('audio')!
  Object.defineProperty(renewed, 'duration', { configurable: true, value: 200 })
  fireEvent.loadedMetadata(renewed)
  expect(renewed.currentTime).toBe(72)
  expect(play.mock.contexts).toContain(renewed)
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  expect(fetchMock).toHaveBeenCalledTimes(2)
  expect(fetchMock.mock.calls[0][0]).not.toContain('refresh=1')
  expect(fetchMock.mock.calls[1][0]).toContain('/view?refresh=1')
})

it('limita a recuperação automática e mantém uma tentativa manual disponível', async () => {
  const fetchMock = vi.fn().mockImplementation(async () => link())
  vi.stubGlobal('fetch', fetchMock)
  const { container } = render(<ProtectedMedia asset={asset} token="test" minimal />)
  await waitFor(() => expect(container.querySelector('audio')).not.toBeNull())
  const audio = container.querySelector('audio')!
  audio.currentTime = 36
  fireEvent.loadedMetadata(audio)
  fireEvent.error(container.querySelector('audio')!)
  await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2))
  await waitFor(() => expect(container.querySelector('audio')).not.toBeNull())
  Object.defineProperty(container.querySelector('audio')!, 'duration', {
    configurable: true,
    value: 100,
  })
  fireEvent.loadedMetadata(container.querySelector('audio')!)
  fireEvent.error(container.querySelector('audio')!)
  expect(screen.getByRole('alert')).toHaveTextContent('Não foi possível carregar')
  expect(fetchMock).toHaveBeenCalledTimes(2)
  fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }))
  await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3))
  await waitFor(() => expect(container.querySelector('audio')).not.toBeNull())
  const renewed = container.querySelector('audio')!
  Object.defineProperty(renewed, 'duration', { configurable: true, value: 100 })
  fireEvent.loadedMetadata(renewed)
  expect(renewed.currentTime).toBe(36)
})

it('oferece recuperação quando o arquivo fica sem responder e não fica carregando indefinidamente', async () => {
  vi.useFakeTimers()
  const fetchMock = vi.fn().mockImplementation(async () => link())
  vi.stubGlobal('fetch', fetchMock)
  const { container } = render(<ProtectedMedia asset={asset} token="test" minimal />)
  await act(async () => {
    await vi.advanceTimersByTimeAsync(0)
  })
  expect(container.querySelector('audio')).not.toBeNull()
  await act(async () => {
    await vi.advanceTimersByTimeAsync(8000)
  })
  expect(screen.getByRole('status')).toHaveTextContent('O carregamento está demorando')
  expect(screen.getByRole('button', { name: 'Tentar novamente' })).toBeInTheDocument()
  await act(async () => {
    await vi.advanceTimersByTimeAsync(37000)
  })
  expect(fetchMock).toHaveBeenCalledTimes(2)
  await act(async () => {
    await vi.advanceTimersByTimeAsync(45000)
  })
  expect(screen.getByRole('alert')).toBeInTheDocument()
  expect(fetchMock).toHaveBeenCalledTimes(2)
})

it('distingue bloqueio de reprodução automática de falha no arquivo', async () => {
  const fetchMock = vi.fn().mockImplementation(async () => link())
  vi.stubGlobal('fetch', fetchMock)
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockRejectedValue(
    new DOMException('Tap required', 'NotAllowedError'),
  )
  const { container } = render(<ProtectedMedia asset={asset} token="test" minimal autoPlay />)
  await screen.findByText('Toque em reproduzir para iniciar o áudio.')
  expect(fetchMock).toHaveBeenCalledTimes(1)
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  const audio = container.querySelector('audio')!
  fireEvent.loadedMetadata(audio)
  fireEvent.play(audio)
  expect(screen.queryByText('Toque em reproduzir para iniciar o áudio.')).not.toBeInTheDocument()
})

it('detecta reprodução travada, mas não recarrega um áudio pausado por escolha do aluno', async () => {
  vi.useFakeTimers()
  const fetchMock = vi.fn().mockImplementation(async () => link())
  vi.stubGlobal('fetch', fetchMock)
  const play = vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue()
  const { container } = render(<ProtectedMedia asset={asset} token="test" minimal autoPlay />)
  await act(async () => {
    await vi.advanceTimersByTimeAsync(0)
  })
  const audio = container.querySelector('audio')!
  audio.currentTime = 48
  fireEvent.loadedMetadata(audio)
  fireEvent.play(audio)
  fireEvent.waiting(audio)
  await act(async () => {
    await vi.advanceTimersByTimeAsync(8000)
  })
  expect(screen.getByRole('status')).toHaveTextContent('O carregamento está demorando')
  fireEvent.pause(audio)
  await act(async () => {
    await vi.advanceTimersByTimeAsync(45000)
  })
  expect(fetchMock).toHaveBeenCalledTimes(1)
  fireEvent.play(audio)
  fireEvent.waiting(audio)
  await act(async () => {
    await vi.advanceTimersByTimeAsync(45000)
  })
  expect(fetchMock).toHaveBeenCalledTimes(2)
  const restored = container.querySelector('audio')!
  Object.defineProperty(restored, 'duration', { configurable: true, value: 180 })
  const playsBeforeRestore = play.mock.calls.length
  fireEvent.loadedMetadata(restored)
  expect(restored.currentTime).toBe(48)
  expect(play).toHaveBeenCalledTimes(playsBeforeRestore + 1)
})
