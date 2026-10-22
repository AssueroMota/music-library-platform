import { useEffect, useState } from 'react'
import { CheckCircle2, Clock3, LoaderCircle, Mail, Music2 } from 'lucide-react'
import { api, type OrderResponse } from '../lib/api'
import { Logo } from './ui'

export function CheckoutReturn() {
  const [order, setOrder] = useState<OrderResponse | null>(null)
  const [error, setError] = useState('')
  const [refresh, setRefresh] = useState(0)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    document.title = 'Seu pedido | Music Library'
    const id = new URLSearchParams(window.location.search).get('order')
    let token: string | null = null
    try {
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
          (result.status === 'PENDING' ||
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
  }, [refresh])

  let title = 'Consultando seu pedido'
  let message = 'Estamos verificando a confirmação do pagamento no servidor.'
  if (order?.status === 'PENDING') {
    title = 'Aguardando confirmação'
    message =
      'Seu pagamento ainda não foi confirmado. Se você já pagou, aguarde a atualização. O acesso será liberado após a confirmação.'
  }
  if (order?.status === 'APPROVED') {
    title = order.accessReady ? 'Seu repertório está pronto.' : 'Pagamento confirmado.'
    message = order.accessReady
      ? order.emailSent
        ? 'Sua biblioteca foi liberada. Enviamos um link de acesso ao e-mail informado no Mercado Pago.'
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
        <p role="status">{error || message}</p>
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
        <a className="button button-primary" href="/biblioteca">
          <Mail size={17} /> Acessar minha biblioteca
        </a>
        <a className="checkout-back" href="/#planos">
          Voltar aos planos
        </a>
      </main>
    </div>
  )
}
