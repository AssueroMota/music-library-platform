import { useState } from 'react'
import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { LibraryPreview } from '../components/LibraryPreview'
import { InstrumentSelector } from '../components/InstrumentSelector'
import { Header } from '../components/Header'
import { PricingSection } from '../components/PricingSection'
import { InfoDialog } from '../components/InfoDialog'
import { AudioPlayer } from '../components/AudioPlayer'
import type { InstrumentId } from '../types'

function Demo() {
  const [instrument, setInstrument] = useState<InstrumentId>('violin')
  return (
    <>
      <InstrumentSelector selected={instrument} onSelect={setInstrument} />
      <LibraryPreview instrument={instrument} onInstrumentChange={setInstrument} />
    </>
  )
}

describe('demonstração da biblioteca', () => {
  it('sincroniza a escolha do instrumento e combina busca, estilo e tonalidade', async () => {
    const user = userEvent.setup()
    render(<Demo />)
    await user.click(screen.getAllByRole('button', { name: /Explorar repertório/ })[1])
    expect(screen.getByRole('combobox', { name: 'Filtrar instrumento' })).toHaveValue('saxophone')
    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Filtrar tonalidade' }),
      'Lá menor',
    )
    expect(screen.getByText('1 resultado')).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /Primeira luz.*Contemporâneo/ }),
    ).not.toBeInTheDocument()
    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Filtrar estilo' }),
      'Contemporâneo',
    )
    expect(screen.getByText('Nenhum estudo por aqui.')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Limpar filtros' }))
    expect(screen.getByText('2 resultados')).toBeInTheDocument()
    await user.type(screen.getByRole('textbox', { name: 'Buscar músicas' }), 'primeira LUZ')
    expect(screen.getByText('1 resultado')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Limpar busca' }))
    expect(screen.getByText('2 resultados')).toBeInTheDocument()
  })

  it('filtra favoritos locais e explica o estado vazio', async () => {
    const user = userEvent.setup()
    render(<LibraryPreview instrument="violin" onInstrumentChange={vi.fn()} />)
    await user.click(screen.getByRole('button', { name: 'Adicionar Primeira luz aos favoritos' }))
    expect(
      screen.getByRole('button', { name: 'Remover Primeira luz dos favoritos' }),
    ).toHaveAttribute('aria-pressed', 'true')
    await user.click(screen.getByRole('button', { name: 'Favoritos' }))
    expect(screen.getByText('1 resultado')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Remover Primeira luz dos favoritos' }))
    expect(screen.getByText('0 resultados')).toBeInTheDocument()
    expect(screen.getByText('Nenhum estudo por aqui.')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Minha biblioteca' }))
    expect(screen.getByText('2 resultados')).toBeInTheDocument()
  })
})

it('fecha o menu por Escape e devolve o foco ao botão', async () => {
  const user = userEvent.setup()
  render(<Header />)
  await user.click(screen.getByRole('button', { name: 'Abrir menu' }))
  expect(screen.getByRole('navigation', { name: 'Navegação móvel' })).toBeVisible()
  await user.keyboard('{Escape}')
  expect(screen.queryByRole('navigation', { name: 'Navegação móvel' })).not.toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Abrir menu' })).toHaveFocus()
})

it('apresenta informações da modalidade sem simular checkout', async () => {
  const user = userEvent.setup()
  function PricingDemo() {
    const [info, setInfo] = useState<{ title: string; text: string } | null>(null)
    return (
      <>
        <PricingSection onInfo={(title, text) => setInfo({ title, text })} />
        <InfoDialog info={info} onClose={() => setInfo(null)} />
      </>
    )
  }
  render(<PricingDemo />)
  await user.click(screen.getAllByRole('button', { name: 'Conhecer a modalidade' })[0])
  const dialog = screen.getByRole('dialog', { name: 'Biblioteca por instrumento' })
  expect(within(dialog).getByText(/Não há checkout ou cobrança/)).toBeInTheDocument()
  await user.click(within(dialog).getByRole('button', { name: 'Entendi' }))
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
})

it('coordena play e pause entre players e permite avançar o áudio', async () => {
  const user = userEvent.setup()
  const paused = new WeakMap<HTMLMediaElement, boolean>()
  vi.spyOn(HTMLMediaElement.prototype, 'paused', 'get').mockImplementation(function (
    this: HTMLMediaElement,
  ) {
    return paused.get(this) ?? true
  })
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(async function (
    this: HTMLMediaElement,
  ) {
    paused.set(this, false)
    this.dispatchEvent(new Event('play'))
  })
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(function (
    this: HTMLMediaElement,
  ) {
    paused.set(this, true)
    this.dispatchEvent(new Event('pause'))
  })
  const { container } = render(
    <>
      <AudioPlayer src="/audio/primeira-luz-backing.wav" label="acompanhamento" />
      <AudioPlayer src="/audio/primeira-luz-lead.wav" label="melodia" />
    </>,
  )
  const audio = container.querySelector('audio')!
  Object.defineProperty(audio, 'duration', { value: 12.2 })
  fireEvent.loadedMetadata(audio)
  await user.click(screen.getByRole('button', { name: 'Reproduzir acompanhamento' }))
  expect(screen.getByRole('button', { name: 'Pausar acompanhamento' })).toBeInTheDocument()
  fireEvent.change(screen.getByRole('slider', { name: 'Progresso de acompanhamento' }), {
    target: { value: '5' },
  })
  expect(audio.currentTime).toBe(5)
  await user.click(screen.getByRole('button', { name: 'Reproduzir melodia' }))
  expect(screen.getByRole('button', { name: 'Reproduzir acompanhamento' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Pausar melodia' })).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Pausar melodia' }))
  expect(screen.getByRole('button', { name: 'Reproduzir melodia' })).toBeInTheDocument()
  vi.restoreAllMocks()
})
