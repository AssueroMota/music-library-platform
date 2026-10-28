import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { PageErrorBoundary } from './components/PageErrorBoundary'
import { RoutePage } from './RoutePage'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PageErrorBoundary>
      <RoutePage />
    </PageErrorBoundary>
  </StrictMode>,
)
