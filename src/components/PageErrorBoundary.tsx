import { Component, type ReactNode } from 'react'
import { Logo } from './BrandLogo'

export class PageErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    if (!this.state.failed) return this.props.children
    return (
      <div className="checkout-page">
        <header className="checkout-page-header">
          <Logo href="/" />
        </header>
        <main className="checkout-status-card">
          <h1>Vamos tentar novamente.</h1>
          <p role="alert">
            Não foi possível carregar esta página. Recarregue para tentar novamente.
          </p>
          <button className="button button-primary" onClick={() => window.location.reload()}>
            Recarregar página
          </button>
          <a href="/" className="checkout-back">
            Voltar ao site
          </a>
        </main>
      </div>
    )
  }
}
