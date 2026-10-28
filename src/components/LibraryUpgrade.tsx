import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight, Check, LoaderCircle, X } from 'lucide-react'
import {
  api,
  ApiError,
  checkoutAttempt,
  LIBRARY_REQUEST_TIMEOUT_MS,
  trustedCheckoutUrl,
} from '../lib/api'
import { formatBRL } from '../../shared/products'
import type { UpgradeQuote } from '../../shared/upgrade'

export function LibraryUpgrade({
  token,
  userId,
  alreadyComplete,
  onRefresh,
  onClose,
}: {
  token: string
  userId: string
  alreadyComplete: boolean
  onRefresh: () => void
  onClose: () => void
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [quote, setQuote] = useState<UpgradeQuote | null>(
    alreadyComplete ? { alreadyComplete: true } : null,
  )
  const [loading, setLoading] = useState(!alreadyComplete)
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const busy = useRef(false)
  useEffect(() => {
    dialog.current?.showModal()
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [])
  useEffect(() => {
    if (alreadyComplete) return
    const controller = new AbortController()
    setLoading(true)
    api<UpgradeQuote>(
      '/library/upgrade',
      { headers: { Authorization: `Bearer ${token}` }, signal: controller.signal },
      LIBRARY_REQUEST_TIMEOUT_MS,
    )
      .then(setQuote)
      .catch((reason: Error) => {
        if (!controller.signal.aborted) setError(reason.message)
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [token, retry, alreadyComplete])

  async function purchase() {
    if (
      !quote ||
      quote.alreadyComplete ||
      !quote.available ||
      !quote.checkoutEnabled ||
      busy.current
    )
      return
    busy.current = true
    setSubmitting(true)
    setError('')
    try {
      sessionStorage.setItem(`ml:upgrade-pending:${userId}`, '1')
      if (quote.pendingCheckoutUrl) {
        window.location.assign(trustedCheckoutUrl(quote.pendingCheckoutUrl))
        return
      }
      const attempt = checkoutAttempt(`upgrade:${userId}:${quote.priceCents}`)
      const result = await api<{ orderId: string; checkoutUrl: string }>(
        '/library/upgrade',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Idempotency-Key': attempt.key,
            'X-Checkout-Token': attempt.token,
          },
          body: JSON.stringify({ expectedPriceCents: quote.priceCents }),
        },
        LIBRARY_REQUEST_TIMEOUT_MS,
      )
      sessionStorage.setItem(`ml:order:${result.orderId}`, attempt.token)
      window.location.assign(trustedCheckoutUrl(result.checkoutUrl))
    } catch (reason) {
      if (
        reason instanceof ApiError &&
        ['ORDER_FINISHED', 'ORDER_EXPIRED', 'CHECKOUT_CONFLICT'].includes(reason.code)
      )
        sessionStorage.removeItem(`ml:checkout:upgrade:${userId}:${quote.priceCents}`)
      if (
        reason instanceof ApiError &&
        ['PRODUCT_PRICE_CHANGED', 'UPGRADE_PENDING', 'ALREADY_COMPLETE'].includes(reason.code)
      ) {
        setQuote(null)
        setRetry((value) => value + 1)
      }
      setError(reason instanceof Error ? reason.message : 'Não foi possível iniciar o upgrade.')
      busy.current = false
      setSubmitting(false)
    }
  }

  return (
    <dialog
      ref={dialog}
      className="checkout-dialog library-upgrade-dialog"
      aria-labelledby="upgrade-title"
      onCancel={(event) => {
        if (busy.current) event.preventDefault()
        else onClose()
      }}
      onClick={(event) => {
        if (event.target === dialog.current && !busy.current) onClose()
      }}
    >
      <div className="checkout-dialog-body">
        <button
          className="checkout-close"
          onClick={onClose}
          disabled={submitting}
          aria-label="Fechar upgrade"
        >
          <X size={21} />
        </button>
        <span className="eyebrow">MAIS POSSIBILIDADES PARA TOCAR</span>
        <h2 id="upgrade-title">
          Sua biblioteca <span>completa.</span>
        </h2>
        <ul className="checkout-details">
          <li>
            <Check size={17} /> Playbacks junto das suas partituras
          </li>
          <li>
            <Check size={17} /> 42 setlists prontos
          </li>
          <li>
            <Check size={17} /> Acesso vitalício no mesmo link pessoal
          </li>
        </ul>
        {loading && (
          <p role="status" className="repertoire-loading">
            <LoaderCircle className="checkout-spinner" size={18} /> Calculando seu desconto…
          </p>
        )}
        {quote?.alreadyComplete ? (
          <>
            <p className="checkout-intro">
              Sua conta já possui o Completo. Você está visualizando o Básico e pode voltar ao seu
              acesso completo sem pagar novamente.
            </p>
            <button className="button library-upgrade-primary" onClick={onRefresh}>
              Abrir meu Completo <ArrowUpRight size={18} />
            </button>
          </>
        ) : (
          quote && (
            <>
              <dl className="library-upgrade-summary">
                <div>
                  <dt>Plano Completo</dt>
                  <dd>{formatBRL(quote.completePriceCents)}</dd>
                </div>
                <div>
                  <dt>Você já pagou no Básico</dt>
                  <dd>− {formatBRL(quote.creditCents)}</dd>
                </div>
                <div>
                  <dt>Somente a diferença</dt>
                  <dd>{formatBRL(quote.priceCents)}</dd>
                </div>
              </dl>
              <p className="checkout-intro">
                O upgrade será vinculado a <strong>{quote.email}</strong>. Após a confirmação do
                pagamento, seu mesmo link abrirá os playbacks e os 42 setlists.
              </p>
              {(!quote.available || !quote.checkoutEnabled) && (
                <p className="checkout-notice">O upgrade está temporariamente indisponível.</p>
              )}
              <button
                className="button library-upgrade-primary"
                disabled={loading || submitting || !quote.available || !quote.checkoutEnabled}
                onClick={() => void purchase()}
              >
                {submitting ? (
                  <>
                    <LoaderCircle className="checkout-spinner" size={18} /> Abrindo pagamento…
                  </>
                ) : (
                  <>
                    {quote.pendingCheckoutUrl
                      ? 'Continuar pagamento iniciado'
                      : `Fazer upgrade por ${formatBRL(quote.priceCents)}`}{' '}
                    <ArrowUpRight size={18} />
                  </>
                )}
              </button>
            </>
          )
        )}
        {error && (
          <p className="checkout-error" role="alert">
            {error}
          </p>
        )}
        {!loading && !quote && (
          <button
            className="repertoire-action"
            onClick={() => {
              setError('')
              setRetry((value) => value + 1)
            }}
          >
            Tentar novamente
          </button>
        )}
        {!loading && !quote?.alreadyComplete && (
          <button className="checkout-back" disabled={submitting} onClick={onRefresh}>
            Já paguei · Atualizar meu acesso
          </button>
        )}
      </div>
    </dialog>
  )
}
