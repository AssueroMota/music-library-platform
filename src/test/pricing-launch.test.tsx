import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { PricingSection } from '../components/PricingSection'
import { LaunchOfferHeader } from '../components/LaunchOfferCountdown'
import { violinLaunch } from '../../shared/violin-launch'

afterEach(() => vi.useRealTimers())

it('encerra o contador do topo e atualiza o preço sem recarregar a página', () => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date(Date.parse(violinLaunch.endsAt) - 2000))
  const { container } = render(
    <>
      <LaunchOfferHeader onCheckout={() => {}} />
      <PricingSection onCheckout={() => {}} />
    </>,
  )
  expect(screen.getByRole('timer')).toBeInTheDocument()
  expect(screen.getByText('27,90')).toBeInTheDocument()
  expect(container.querySelector('s')).toHaveTextContent('R$ 49,90')
  expect(container.querySelector('.site-offer-header')).toBeInTheDocument()
  expect(container.querySelector('.offer-launch-banner')).not.toBeInTheDocument()
  act(() => vi.advanceTimersByTime(3000))
  expect(screen.queryByRole('timer')).not.toBeInTheDocument()
  expect(container.querySelector('.site-offer-header')).not.toBeInTheDocument()
  expect(screen.queryByText('27,90')).not.toBeInTheDocument()
  expect(screen.getByText('49,90')).toBeInTheDocument()
  expect(container.querySelector('s')).not.toBeInTheDocument()
  expect(screen.getByText('12,90')).toBeInTheDocument()
})

it('abre o plano Completo pelo botão do cabeçalho persistente', () => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date(violinLaunch.startsAt))
  const onCheckout = vi.fn()
  render(<LaunchOfferHeader onCheckout={onCheckout} />)
  fireEvent.click(screen.getByRole('button', { name: /Quero aproveitar/ }))
  expect(onCheckout).toHaveBeenCalledWith('complete')
})
