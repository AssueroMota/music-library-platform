import { useEffect, useState } from 'react'
import { CheckCircle2, Clock3, Copy, LoaderCircle, Mail, Music2 } from 'lucide-react'
import { api, trustedCheckoutUrl, trustedPersonalLibraryUrl, type OrderResponse } from '../lib/api'
import { Logo } from './ui'
import { formatBRL } from '../../shared/products'

export function CheckoutReturn() {
  const [order, setOrder] = useState<OrderResponse | null>(null)
  const [error, setError] = useState('')
  const [refresh, setRefresh] = useState(0)
  const [loading, setLoading] = useState(true)
  const [copyMessage, setCopyMessage] = useState('')
  const [startPayment] = useState(
    () => new URLSearchParams(window.location.search).get('iniciar') === '1',
  )
  useEffect(() => {
    document.title = 'Seu pedido | Music Library'
    const id = new URLSearchParams(window.location.search).get('order')
    let token: string | null = null
    try {
      const suppliedToken = new URLSearchParams(window.location.hash.slice(1)).get('token')
      if (id && suppliedToken && /^[a-f0-9]{64}$/.test(suppliedToken)) {
        sessionStorage.setItem(`ml:order:${id}`, suppliedToken)
        window.history.replaceState(
          window.history.state,
          '',
          window.location.pathname + window.location.search,
        )
      }
      token = id && sessionStorage.getItem(`ml:order:${id}`)
    } catch {
      /* Private browsing may block storage. */
    }
    if (!id || !token) {
      setError(
        'Não foi possível identificar o pedido neste navegador. Confira seu e-mail ou acesse a biblioteca para solicitar um link.',
      )
      setLoading(false)
      return
    }
    const controller = new AbortController()
    let timer: ReturnType<typeof setTimeout>
    let polls = 0
    async function check() {
      setError('')
      try {
        const result = await api<OrderResponse>(`/orders/${encodeURIComponent(id!)}`, {
          headers: { 'X-Checkout-Token': token! },
          signal: controller.signal,
        })
        setOrder(result)
        if (
          polls++ < 40 &&
          ((!startPayment && result.status === 'PENDING') ||
            (result.status === 'APPROVED' && (!result.accessReady || !result.emailSent)))
        )
          timer = setTimeout(check, 3000)
      } catch (e) {
        if (!controller.signal.aborted)
          setError(e instanceof Error ? e.message : 'Não foi possível consultar o pedido.')
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }
    void check()
    return () => {
      controller.abort()
      clearTimeout(timer)
    }
  }, [refresh, startPayment])

  let checkoutUrl: string | null = null
  let personalLink: string | null = null
  if (order?.status === 'APPROVED' && order.accessReady && order.personalLink) {
    try {
      personalLink = trustedPersonalLibraryUrl(order.personalLink)
    } catch {
      /* Only display a personal link issued for this site's library. */
    }
  }
  if (startPayment && order?.status === 'PENDING' && order.checkoutUrl) {
    try {
      checkoutUrl = trustedCheckoutUrl(order.checkoutUrl)
    } catch {
      /* Never link to an untrusted payment host. */
    }
  }

  let title = 'Consultando seu pedido'
  let message = 'Estamos verificando a confirmação do pagamento no servidor.'
  if (order?.status === 'PENDING') {
    title = 'Aguardando confirmação'
    message =
      'Seu pagamento ainda não foi confirmado. Se você já pagou, aguarde a atualização. O acesso será liberado após a confirmação.'
  }
  if (checkoutUrl) {
    title = 'Confira seu pagamento.'
    message =
      'Confira o valor antes de continuar. Após a confirmação, seu link pessoal aparecerá aqui e será enviado por e-mail.'
  }
  if (order?.status === 'APPROVED') {
    title = order.accessReady
      ? 'Pagamento confirmado. Seu acesso está pronto!'
      : 'Pagamento confirmado.'
    message = order.accessReady
      ? order.emailSent
        ? 'Sua biblioteca foi liberada. Enviamos seu link pessoal ao e-mail informado na compra.'
        : 'Sua biblioteca foi liberada. O envio do e-mail está em processamento. Você já pode solicitar um link na página da biblioteca.'
      : 'Estamos preparando seu acesso à biblioteca. Você receberá as orientações por e-mail assim que ele estiver disponível.'
  }
  if (order && ['REJECTED', 'CANCELED'].includes(order.status)) {
    title = 'Pagamento não concluído'
    message =
      'Este pedido não teve o pagamento confirmado. Você pode voltar aos planos e iniciar uma nova compra.'
  }
  if (order && ['REFUNDED', 'CHARGED_BACK'].includes(order.status)) {
    title = 'Pagamento estornado'
    message =
      'O pagamento deste pedido foi estornado ou contestado. O acesso referente a esta compra foi suspenso.'
  }
  return (
    <div className="checkout-page">
      <header className="checkout-page-header">
        <a href="/" aria-label="Voltar ao início">
          <Music2 size={23} />
        </a>
        <Logo href="/" />
        <span>SEU PEDIDO</span>
      </header>
      <main className="checkout-status-card">
        <span className="checkout-status-icon">
          {loading ? (
            <LoaderCircle className="checkout-spinner" />
          ) : order?.status === 'APPROVED' && order.accessReady ? (
            <CheckCircle2 />
          ) : (
            <Clock3 />
          )}
        </span>
        <span className="eyebrow">MUSIC LIBRARY</span>
        <h1>{error && !order ? 'Vamos conferir seu pedido.' : title}</h1>
        {order && <h2>{order.productName}</h2>}
        {checkoutUrl && order && (
          <div className="checkout-total" style={{ marginTop: 24 }}>
            <span>Total a pagar</span>
            <strong>{formatBRL(order.priceCents)}</strong>
          </div>
        )}
        <p role="status">{error || message}</p>
        {checkoutUrl && (
          <a className="button button-primary" href={checkoutUrl}>
            Continuar para o pagamento
          </a>
        )}
        {personalLink && (
          <section className="checkout-personal-link" aria-labelledby="personal-link-title">
            <h2 id="personal-link-title">Seu link pessoal da biblioteca</h2>
            <p>Guarde nos favoritos. Este link é só seu e continuará sendo o mesmo.</p>
            <a className="button button-primary" href={personalLink}>
              <Music2 size={18} /> Acessar minha biblioteca
            </a>
            <label htmlFor="purchase-personal-link">Seu endereço de acesso</label>
            <input
              id="purchase-personal-link"
              type="text"
              value={personalLink}
              readOnly
              onFocus={(event) => event.target.select()}
            />
            <button
              className="button button-outline"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(personalLink)
                  setCopyMessage('Link copiado!')
                } catch {
                  setCopyMessage('Selecione o endereço acima e copie seu link.')
                }
              }}
            >
              <Copy size={16} /> Copiar meu link
            </button>
            <span role="status" className="checkout-copy-status">
              {copyMessage}
            </span>
          </section>
        )}
        {!personalLink && (
          <a
            className={`button ${checkoutUrl ? 'button-outline' : 'button-primary'}`}
            href="/biblioteca"
          >
            <Mail size={17} /> Acessar minha biblioteca
          </a>
        )}
        {(!order ||
          order.status === 'PENDING' ||
          (order.status === 'APPROVED' && !personalLink)) && (
          <button
            className="button button-outline"
            disabled={loading}
            onClick={() => {
              setLoading(true)
              setRefresh((v) => v + 1)
            }}
          >
            Atualizar status
          </button>
        )}
        <a className="checkout-back" href="/#planos">
          Voltar aos planos
        </a>
      </main>
    </div>
  )
}
