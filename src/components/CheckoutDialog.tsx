import { useEffect, useRef, useState } from 'react'
import {
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ExternalLink,
  LoaderCircle,
  LockKeyhole,
  Music2,
  X,
} from 'lucide-react'
import { instruments } from '../data/content'
import {
  api,
  ApiError,
  checkoutAttempt,
  trustedCheckoutUrl,
  type ProductResponse,
} from '../lib/api'
import { formatBRL } from '../../shared/products'

export function CheckoutDialog({
  plan,
  instrument,
  onClose,
}: {
  plan: string | null
  instrument: string | null
  onClose: () => void
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [selectedInstrument, setSelectedInstrument] = useState(instrument ?? '')
  const [email, setEmail] = useState('')
  const deliveryEmail = email.trim().toLowerCase()
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(deliveryEmail)
  const [data, setData] = useState<ProductResponse | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [retry, setRetry] = useState(0)
  const busy = useRef(false)
  const productId = plan === 'complete' ? 'library-complete' : `library-${selectedInstrument}`
  const product = data?.products.find((p) => p.id === productId)

  useEffect(() => {
    if (!plan) {
      dialog.current?.close()
      return
    }
    dialog.current?.showModal()
    setSelectedInstrument(instrument ?? '')
    setError('')
    setData(null)
    setLoading(true)
    const controller = new AbortController()
    api<ProductResponse>('/products', { signal: controller.signal })
      .then(setData)
      .catch((e: Error) => {
        if (!controller.signal.aborted) setError(e.message)
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      controller.abort()
      document.body.style.overflow = previous
    }
  }, [plan, instrument, retry])

  async function purchase() {
    if (!product?.available || !data?.checkoutEnabled || !emailValid || busy.current) return
    busy.current = true
    setSubmitting(true)
    setError('')
    try {
      const attempt = checkoutAttempt(`${product.id}:${deliveryEmail}`)
      const result = await api<{ orderId: string; checkoutUrl: string }>('/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': attempt.key,
          'X-Checkout-Token': attempt.token,
        },
        body: JSON.stringify({ productId: product.id, email: deliveryEmail }),
      })
      const url = trustedCheckoutUrl(result.checkoutUrl)
      sessionStorage.setItem(`ml:order:${result.orderId}`, attempt.token)
      window.location.assign(url)
    } catch (e) {
      if (
        e instanceof ApiError &&
        ['ORDER_FINISHED', 'ORDER_EXPIRED', 'CHECKOUT_CONFLICT'].includes(e.code)
      )
        sessionStorage.removeItem(`ml:checkout:${product.id}:${deliveryEmail}`)
      setError(
        e instanceof Error ? e.message : 'Não foi possível iniciar o pagamento. Tente novamente.',
      )
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
          Confira sua escolha. O pagamento é feito no ambiente do Mercado Pago.
        </p>
        {plan === 'basic' && (
          <div className="checkout-field">
            <label htmlFor="checkout-instrument">Qual é o seu instrumento?</label>
            <select
              id="checkout-instrument"
              value={selectedInstrument}
              disabled={submitting}
              onChange={(e) => {
                setSelectedInstrument(e.target.value)
                setError('')
              }}
            >
              <option value="">Selecione seu instrumento</option>
              {instruments.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
        )}
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
            disabled={submitting}
            onChange={(event) => setEmail(event.target.value)}
          />
          <p className="checkout-intro">
            Utilize seu Gmail. Enviaremos seu link pessoal para este endereço após a confirmação do
            pagamento.
          </p>
        </div>
        <div className="checkout-order-summary" aria-live="polite">
          <span className="checkout-product-icon">
            <Music2 size={27} />
          </span>
          <div>
            <span className="micro-label">SUA ESCOLHA</span>
            <h3>
              {product?.name ??
                (plan === 'complete' ? 'Acesso Completo' : 'Biblioteca por instrumento')}
            </h3>
            <p>
              {plan === 'complete'
                ? 'Os seis instrumentos, em uma só biblioteca.'
                : 'Partituras e backing tracks do seu instrumento.'}
            </p>
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
            <CheckCircle2 size={16} /> Utilize um Gmail (@gmail.com) no pagamento para receber seu
            link pessoal. Use o mesmo endereço para acessar a biblioteca.
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
            ? 'Abrindo Mercado Pago…'
            : loading
              ? 'Consultando disponibilidade…'
              : 'Continuar para o pagamento'}
          {!loading && !submitting && <ArrowRight size={17} />}
        </button>
        <p className="checkout-provider">
          <ExternalLink size={13} /> Você vai concluir a compra no Mercado Pago.
        </p>
        <button type="button" className="checkout-back" onClick={onClose} disabled={submitting}>
          <ChevronLeft size={15} /> Voltar aos planos
        </button>
      </form>
    </dialog>
  )
}
