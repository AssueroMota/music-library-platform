import { StrictMode } from 'react'
import App from './App'
import { PageErrorBoundary } from './components/PageErrorBoundary'

export function HomePage({ renderedAt }: { renderedAt?: number }) {
  return (
    <StrictMode>
      <PageErrorBoundary>
        <App renderedAt={renderedAt} />
      </PageErrorBoundary>
    </StrictMode>
  )
}
