import { ArrowUpRight } from 'lucide-react'
import {
  continuePaymentInTab,
  paymentFallbackUrl,
  reservePaymentTab,
  type PaymentDestination,
} from '../lib/payment-tab'

export interface ReadyPayment {
  destination: PaymentDestination
  opened: boolean
}

export function PaymentContinuation({
  payment,
  className = 'button button-primary checkout-submit',
}: {
  payment: ReadyPayment
  className?: string
}) {
  return (
    <>
      <p className="checkout-notice" role="status">
        {payment.opened
          ? 'O pagamento foi aberto em outra aba. Você pode manter esta página aberta.'
          : 'Seu pagamento está pronto. Clique abaixo para continuar em outra aba.'}
      </p>
      <a
        className={className}
        href={paymentFallbackUrl(payment.destination)}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(event) => {
          const tab = reservePaymentTab()
          if (continuePaymentInTab(tab, payment.destination)) event.preventDefault()
        }}
      >
        Abrir pagamento em outra aba <ArrowUpRight size={18} />
      </a>
    </>
  )
}
