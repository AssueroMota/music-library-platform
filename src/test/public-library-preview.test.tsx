import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, it, vi } from 'vitest'
import { PublicLibraryPreview } from '../components/PublicLibraryPreview'
import { violinDemonstration } from '../data/demonstration'

afterEach(() => vi.unstubAllGlobals())

it('permite experimentar somente os arquivos públicos e navegar pelo catálogo sem solicitar acesso privado', async () => {
  const fetchMock = vi.fn()
  vi.stubGlobal('fetch', fetchMock)
  const { container } = render(<PublicLibraryPreview />)
  const user = userEvent.setup()
  await user.type(screen.getByRole('searchbox'), 'A Thousand Years')
  await user.click(screen.getByRole('button', { name: 'Ver partitura de A Thousand Years' }))
  expect(screen.getByRole('img', { name: 'A Thousand Years - Partitura' })).toHaveAttribute(
    'src',
    violinDemonstration.score,
  )
  expect(container.querySelector('audio')).toHaveAttribute('src', violinDemonstration.backing)
  expect(
    screen.queryByRole('button', { name: 'Renovar acesso ao arquivo' }),
  ).not.toBeInTheDocument()
  await user.selectOptions(screen.getByRole('combobox', { name: 'Zoom da partitura' }), '150')
  expect(screen.getByRole('img', { name: 'A Thousand Years - Partitura' })).toHaveStyle({
    width: '150%',
  })
  await user.click(screen.getByRole('button', { name: 'Fechar materiais' }))
  await user.clear(screen.getByRole('searchbox'))
  await user.type(screen.getByRole('searchbox'), 'Perfect')
  await user.click(screen.getByRole('button', { name: 'Ver partitura de Perfect' }))
  expect(screen.getByText('Este material está na área do aluno.')).toBeInTheDocument()
  expect(container.querySelector('audio')).not.toBeInTheDocument()
  expect(screen.queryByRole('img')).not.toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: /Setlists prontos/ }))
  const cards = within(
    screen.getByRole('region', { name: 'Seu próximo repertório já tem um começo.' }),
  ).getAllByRole('button', { name: /Abrir setlist/ })
  expect(cards).toHaveLength(10)
  await user.click(screen.getByRole('button', { name: 'Abrir setlist Cerimônia romântica' }))
  expect(screen.getByRole('combobox', { name: 'Ordenar por' })).toHaveValue('setlist')
  await user.click(screen.getByRole('button', { name: 'Ver partitura de A Thousand Years' }))
  await user.click(screen.getByRole('button', { name: 'Próxima música do setlist' }))
  expect(screen.getByRole('heading', { name: "Can't Help Falling in Love" })).toBeInTheDocument()
  expect(screen.getByText('Este material está na área do aluno.')).toBeInTheDocument()
  expect(fetchMock).not.toHaveBeenCalled()
})
