import { useState } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'
import { LibraryPreview } from '../components/LibraryPreview'
import { PricingSection } from '../components/PricingSection'
import { AudioPlayer } from '../components/AudioPlayer'
import type { InstrumentId } from '../types'
import App from '../App'

function LibraryDemo({ initialInstrument = null }: { initialInstrument?: InstrumentId | null }) {
  const [instrument, setInstrument] = useState<InstrumentId | null>(initialInstrument)
  return (
    <>
      <LibraryPreview instrument={instrument} onInstrumentChange={setInstrument} />
    </>
  )
}

it('monta a página e permite abrir a organização dos materiais', async () => {
  const user = userEvent.setup()
  const { container } = render(<App />)
  expect(screen.getByRole('main')).toBeInTheDocument()
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Partituras e bases/)
  for (const link of container.querySelectorAll<HTMLAnchorElement>('a[href^="#"]')) {
    expect(
      document.getElementById(link.hash.slice(1)),
      `Destino de ${link.textContent}`,
    ).not.toBeNull()
  }
  expect(screen.queryByRole('button', { name: 'Abrir pasta Violino' })).not.toBeInTheDocument()
  await user.click(screen.getByText('Ver como os materiais ficam organizados'))
  expect(await screen.findByRole('button', { name: 'Abrir pasta Violino' })).toBeInTheDocument()
})

it('seleciona instrumento e combina busca, estilo e tonalidade', async () => {
  const user = userEvent.setup()
  render(<LibraryDemo />)
  await user.selectOptions(
    screen.getByRole('combobox', { name: 'Filtrar instrumento' }),
    'saxophone',
  )
  expect(screen.getByRole('combobox', { name: 'Filtrar instrumento' })).toHaveValue('saxophone')
  await user.selectOptions(screen.getByRole('combobox', { name: 'Filtrar tonalidade' }), 'Lá menor')
  expect(screen.getByText('2 arquivos')).toBeInTheDocument()
  expect(
    screen.queryByRole('button', { name: 'Abrir partitura Primeira luz' }),
  ).not.toBeInTheDocument()
  await user.selectOptions(
    screen.getByRole('combobox', { name: 'Filtrar estilo' }),
    'Contemporâneo',
  )
  expect(screen.getByText('Nenhum arquivo encontrado.')).toBeInTheDocument()
  await user.click(screen.getAllByRole('button', { name: 'Limpar filtros' })[0])
  expect(screen.getByText('4 arquivos')).toBeInTheDocument()
  await user.type(screen.getByRole('textbox', { name: 'Buscar arquivos' }), 'primeira LUZ')
  expect(screen.getByText('2 arquivos')).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Limpar busca' }))
  expect(screen.getByText('4 arquivos')).toBeInTheDocument()
})

it('filtra arquivos favoritos e retorna à raiz das pastas', async () => {
  const user = userEvent.setup()
  render(<LibraryDemo initialInstrument="violin" />)
  await user.click(
    screen.getByRole('button', {
      name: 'Adicionar Primeira luz (Partitura · prévia) aos favoritos',
    }),
  )
  await user.click(screen.getByRole('button', { name: 'Favoritos' }))
  expect(screen.getByText('1 arquivo')).toBeInTheDocument()
  await user.click(
    screen.getByRole('button', { name: 'Remover Primeira luz (Partitura · prévia) dos favoritos' }),
  )
  expect(screen.getByText('0 arquivos')).toBeInTheDocument()
  expect(screen.getByText('Nenhum arquivo encontrado.')).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Minha biblioteca' }))
  await user.click(screen.getByRole('button', { name: 'Abrir pasta Violino' }))
  expect(screen.getByText('4 arquivos')).toBeInTheDocument()
})

it('navega em subpastas, ordena arquivos e abre a prévia com retorno de foco', async () => {
  const user = userEvent.setup()
  render(<LibraryDemo />)
  expect(screen.getAllByRole('button', { name: /^Abrir pasta / })).toHaveLength(6)
  await user.click(screen.getByRole('button', { name: 'Abrir pasta Violino' }))
  await user.click(screen.getByRole('button', { name: 'Abrir pasta Partituras' }))
  expect(screen.getByText('2 arquivos')).toBeInTheDocument()
  expect(
    screen.queryByRole('button', { name: 'Abrir áudio Primeira luz.wav' }),
  ).not.toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Visualização em grade' }))
  expect(screen.getByRole('button', { name: 'Visualização em grade' })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  await user.selectOptions(screen.getByRole('combobox', { name: 'Ordenar arquivos' }), 'desc')
  expect(screen.getAllByRole('button', { name: /^Abrir partitura / })[0]).toHaveAccessibleName(
    'Abrir partitura Primeira luz',
  )
  const opener = screen.getByRole('button', { name: 'Abrir partitura Primeira luz' })
  await user.click(opener)
  expect(screen.getByRole('region', { name: 'Prévia do arquivo' })).toBeInTheDocument()
  expect(
    screen.getByRole('img', { name: /Partitura ilustrativa de Primeira luz/ }),
  ).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Fechar prévia' }))
  expect(opener).toHaveFocus()
  await user.click(screen.getByRole('button', { name: 'Voltar uma pasta' }))
  await user.click(screen.getByRole('button', { name: 'Abrir pasta Backing tracks' }))
  expect(screen.getByRole('button', { name: 'Abrir áudio Primeira luz.wav' })).toBeInTheDocument()
  await user.selectOptions(screen.getByRole('combobox', { name: 'Filtrar instrumento' }), '')
  expect(screen.getByRole('button', { name: 'Abrir pasta Violino' })).toBeInTheDocument()
  expect(
    screen.queryByRole('button', { name: 'Abrir áudio Primeira luz.wav' }),
  ).not.toBeInTheDocument()
})

it('encaminha a escolha correta de cada plano para o checkout', async () => {
  const user = userEvent.setup()
  const onCheckout = vi.fn()
  render(<PricingSection onCheckout={onCheckout} />)
  await user.click(screen.getByRole('button', { name: 'Quero o Plano Básico' }))
  expect(onCheckout).toHaveBeenLastCalledWith('basic')
  await user.click(screen.getByRole('button', { name: 'Quero o Plano Completo' }))
  expect(onCheckout).toHaveBeenLastCalledWith('complete')
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
