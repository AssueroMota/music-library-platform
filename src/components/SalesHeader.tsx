import { useLayoutEffect, useRef } from 'react'
import { ArrowDown } from 'lucide-react'
import { Container, Logo } from './ui'
import { LaunchOfferHeader } from './LaunchOfferCountdown'

export function SalesHeader({
  onFree,
  onCheckout,
}: {
  onFree: () => void
  onCheckout: (plan: string) => void
}) {
  const header = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const element = header.current
    if (!element) return
    function updateHeight() {
      const height = Math.ceil(element!.getBoundingClientRect().height)
      if (height > 0)
        document.documentElement.style.setProperty('--sales-header-height', `${height}px`)
    }
    updateHeight()
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(updateHeight)
    observer?.observe(element)
    window.addEventListener('resize', updateHeight)
    return () => {
      observer?.disconnect()
      window.removeEventListener('resize', updateHeight)
      document.documentElement.style.removeProperty('--sales-header-height')
    }
  }, [])
  return (
    <div ref={header} className="sales-header-stack violin-sales">
      <LaunchOfferHeader onCheckout={onCheckout} />
      <Container>
        <header className="sales-nav">
          <Logo light />
          <nav aria-label="Navegação principal">
            <a href="#ocasioes">Ocasiões</a>
            <a href="#material">Materiais</a>
            <a href="#demonstracao">Demonstração</a>
            <a href="#planos">Planos</a>
            <a href="#perguntas">Dúvidas</a>
          </nav>
          <div className="sales-nav-actions">
            <button className="nav-free" type="button" onClick={onFree}>
              Testar de graça ↗
            </button>
            <a className="nav-offer" href="#planos">
              Escolher meu plano <ArrowDown size={14} />
            </a>
          </div>
        </header>
      </Container>
    </div>
  )
}
