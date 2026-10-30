import { useEffect, useRef, useState } from 'react'
import {
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  LoaderCircle,
  LockKeyhole,
  Music2,
  X,
} from 'lucide-react'
import {
  api,
  ApiError,
  checkoutAttempt,
  trustedCheckoutUrl,
  type ProductResponse,
} from '../lib/api'
import { formatBRL, violinOffers } from '../../shared/products'
import { productCatalog } from '../lib/product-catalog'
import { continuePaymentInTab, reservePaymentTab } from '../lib/payment-tab'
import { PaymentContinuation, type ReadyPayment } from './PaymentContinuation'

export function CheckoutDialog({ plan, onClose }: { plan: string | null; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [email, setEmail] = useState('')
  const deliveryEmail = email.trim().toLowerCase()
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(deliveryEmail)
  const [data, setData] = useState<ProductResponse | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [slowLookup, setSlowLookup] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [retry, setRetry] = useState(0)
  const [payment, setPayment] = useState<ReadyPayment | null>(null)
  const busy = useRef(false)
  const offer = violinOffers[plan === 'complete' ? 1 : 0]
  const productId = offer.id
  const product = data?.products.find((p) => p.id === productId)

  useEffect(() => {
    if (!plan) {
      dialog.current?.close()
      return
    }
    dialog.current?.showModal()
    setError('')
    setPayment(null)
    const cached = productCatalog.peek()
    setData(cached)
    setLoading(!cached)
    setSlowLookup(false)
    let active = true
    const slowTimer = cached ? undefined : window.setTimeout(() => setSlowLookup(true), 5000)
    productCatalog
      .load()
      .then((result) => {
        if (active) setData(result)
      })
      .catch((e: Error) => {
        if (active) setError(e.message)
      })
      .finally(() => {
        window.clearTimeout(slowTimer)
        if (active) setLoading(false)
      })
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.clearTimeout(slowTimer)
      // The lookup also serves prefetch and reopened dialogs; detach this view only.
      active = false
      document.body.style.overflow = previous
    }
  }, [plan, retry])

  async function purchase() {
    if (!product?.available || !data?.checkoutEnabled || !emailValid || busy.current || payment)
      return
    busy.current = true
    setSubmitting(true)
    setError('')
    const paymentTab = reservePaymentTab()
    try {
      const attempt = checkoutAttempt(`${product.id}:${deliveryEmail}:${product.priceCents}`)
      const result = await api<{ orderId: string; checkoutUrl: string }>('/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': attempt.key,
          'X-Checkout-Token': attempt.token,
        },
        body: JSON.stringify({
          productId: product.id,
          email: deliveryEmail,
          expectedPriceCents: product.priceCents,
        }),
      })
      const url = trustedCheckoutUrl(result.checkoutUrl)
      const destination = { checkoutUrl: url, orderId: result.orderId, token: attempt.token }
      setPayment({ destination, opened: continuePaymentInTab(paymentTab, destination) })
    } catch (e) {
      paymentTab?.close()
      if (
        e instanceof ApiError &&
        ['ORDER_FINISHED', 'ORDER_EXPIRED', 'CHECKOUT_CONFLICT'].includes(e.code)
      )
        sessionStorage.removeItem(
          `ml:checkout:${product.id}:${deliveryEmail}:${product.priceCents}`,
        )
      if (e instanceof ApiError && e.code === 'PRODUCT_PRICE_CHANGED') {
        try {
          setData(await productCatalog.load({ refresh: true }))
        } catch {
          setData(null)
        }
      }
      setError(
        e instanceof Error ? e.message : 'Não foi possível iniciar o pagamento. Tente novamente.',
      )
    } finally {
      busy.current = false
      setSubmitting(false)
    }
  }

  return (
    <dialog
      ref={dialog}
      className="checkout-dialog"
      aria-labelledby="checkout-title"
      onCancel={(e) => {
        if (busy.current) e.preventDefault()
        else onClose()
      }}
      onClick={(e) => {
        if (e.target === dialog.current && !busy.current) onClose()
      }}
    >
      <form
        className="checkout-dialog-body"
        onSubmit={(event) => {
          event.preventDefault()
          void purchase()
        }}
      >
        <button
          type="button"
          className="checkout-close"
          onClick={onClose}
          disabled={submitting}
          aria-label="Fechar checkout"
        >
          <X size={21} />
        </button>
        <span className="eyebrow">
          <i /> SEU PRÓXIMO REPERTÓRIO
        </span>
        <h2 id="checkout-title">
          Vamos começar<span> a tocar.</span>
        </h2>
        <p className="checkout-intro">
          Confira sua escolha e informe o e-mail que receberá seu acesso.
        </p>
        <div className="checkout-field">
          <label htmlFor="checkout-email">E-mail para receber seu acesso</label>
          <input
            id="checkout-email"
            type="email"
            autoComplete="email"
            placeholder="voce@gmail.com"
            maxLength={254}
            required
            value={email}
            disabled={submitting || !!payment}
            onChange={(event) => setEmail(event.target.value)}
          />
          <p className="checkout-intro">
            Enviaremos seu link pessoal para este endereço após a confirmação do pagamento.
          </p>
        </div>
        <div className="checkout-order-summary" aria-live="polite">
          <span className="checkout-product-icon">
            <Music2 size={27} />
          </span>
          <div>
            <span className="micro-label">SUA ESCOLHA</span>
            <h3>{product?.name ?? offer.name}</h3>
            <p>{offer.description}</p>
          </div>
          <div className="checkout-total">
            <span>Total</span>
            <strong>{loading ? '…' : product ? formatBRL(product.priceCents) : '—'}</strong>
          </div>
        </div>
        <ul className="checkout-details">
          <li>
            <CheckCircle2 size={16} /> Entrega digital, sem frete.
          </li>
          <li>
            <CheckCircle2 size={16} /> Acesso liberado após a confirmação do pagamento.
          </li>
          <li>
            <CheckCircle2 size={16} /> Seu link pessoal será enviado ao e-mail informado acima.
          </li>
        </ul>
        {data && !data.checkoutEnabled && (
          <p className="checkout-notice" role="status">
            As compras ainda não estão disponíveis. Volte em breve.
          </p>
        )}
        {product && !product.available && (
          <p className="checkout-notice" role="status">
            Este produto está indisponível no momento.
          </p>
        )}
        {data && !product && (
          <p className="checkout-notice" role="status">
            Este plano ainda não está disponível. Volte em breve.
          </p>
        )}
        {error && (
          <div className="checkout-error" role="alert">
            <p>{error}</p>
            {!data && (
              <button type="button" onClick={() => setRetry((v) => v + 1)}>
                Tentar novamente
              </button>
            )}
          </div>
        )}
        {loading && slowLookup && (
          <p className="checkout-notice" role="status">
            O serviço está demorando um pouco para responder. Estamos confirmando o preço do seu
            plano; você ainda não foi cobrado.
          </p>
        )}
        {payment ? (
          <PaymentContinuation payment={payment} />
        ) : (
          <button
            className="button button-primary checkout-submit"
            type="submit"
            disabled={
              loading || submitting || !product?.available || !data?.checkoutEnabled || !emailValid
            }
          >
            {loading || submitting ? (
              <LoaderCircle size={18} className="checkout-spinner" />
            ) : (
              <LockKeyhole size={17} />
            )}
            {submitting
              ? 'Abrindo pagamento…'
              : loading
                ? 'Consultando disponibilidade…'
                : 'Continuar para o pagamento'}
            {!loading && !submitting && <ArrowRight size={17} />}
          </button>
        )}
        {!payment && <p className="checkout-provider">O pagamento abrirá em outra aba.</p>}
        <button type="button" className="checkout-back" onClick={onClose} disabled={submitting}>
          <ChevronLeft size={15} /> Voltar aos planos
        </button>
      </form>
    </dialog>
  )
}
