import { Clock3 } from 'lucide-react'
import { formatBRL } from '../../shared/products'
import { launchTimeRemaining, violinLaunch } from '../../shared/violin-launch'
import { useOfferPricing } from '../lib/use-offer-pricing'

export function LaunchOfferHeader({ onCheckout }: { onCheckout: (plan: string) => void }) {
  const { now, launchActive } = useOfferPricing()
  if (!launchActive) return null
  const remaining = launchTimeRemaining(now)
  const units = [
    [remaining.days, 'dias'],
    [remaining.hours, 'h'],
    [remaining.minutes, 'min'],
    [remaining.seconds, 's'],
  ] as const
  return (
    <header className="site-offer-header" aria-label="Oferta de lançamento">
      <div className="site-offer-header-inner">
        <div className="site-offer-header-copy">
          <span>100 PARTITURAS + PLAYBACKS</span>
          <strong>
            {formatBRL(violinLaunch.launchPriceCents)}{' '}
            <small>até {violinLaunch.deadlineLabel}</small>
          </strong>
        </div>
        <div
          className="site-offer-header-timer"
          role="timer"
          aria-live="off"
          aria-label={`${remaining.days} dias, ${remaining.hours} horas, ${remaining.minutes} minutos e ${remaining.seconds} segundos restantes`}
        >
          {units.map(([value, label]) => (
            <div key={label}>
              <strong>{String(value).padStart(2, '0')}</strong>
              <span>{label}</span>
            </div>
          ))}
        </div>
        <button type="button" onClick={() => onCheckout('complete')}>
          Quero aproveitar <span aria-hidden="true">↗</span>
        </button>
      </div>
    </header>
  )
}

export function LaunchOfferCountdown({ now, active }: { now: number; active: boolean }) {
  if (now < Date.parse(violinLaunch.startsAt)) return null
  if (!active)
    return (
      <p className="offer-launch-ended">
        Plano Completo: {formatBRL(violinLaunch.regularPriceCents)} · pagamento único.
      </p>
    )
  const remaining = launchTimeRemaining(now)
  const units = [
    [remaining.days, 'dias'],
    [remaining.hours, 'horas'],
    [remaining.minutes, 'min'],
    [remaining.seconds, 'seg'],
  ] as const
  return (
    <aside className="offer-launch-banner" aria-label="Condição de lançamento do Plano Completo">
      <div className="offer-launch-copy">
        <span>
          <Clock3 size={15} /> LANÇAMENTO · PLANO COMPLETO
        </span>
        <strong>Leve 100 partituras + playbacks por {formatBRL(violinLaunch.launchPriceCents)}.</strong>
        <p>
          Até {violinLaunch.deadlineLabel}. Em {violinLaunch.regularFromLabel}, o valor passa para{' '}
          <b>{formatBRL(violinLaunch.regularPriceCents)}</b>.
        </p>
        <small>Horário de Brasília. Condição para pedidos iniciados dentro do prazo.</small>
      </div>
      <div className="offer-countdown-wrap">
        <span>ESSA CONDIÇÃO TERMINA EM</span>
        <div
          className="offer-countdown"
          role="timer"
          aria-live="off"
          aria-label={`${remaining.days} dias, ${remaining.hours} horas, ${remaining.minutes} minutos e ${remaining.seconds} segundos restantes`}
        >
          {units.map(([value, label]) => (
            <div key={label}>
              <strong>{String(value).padStart(2, '0')}</strong>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
}
