import { useEffect, useState } from 'react'
import { LoaderCircle } from 'lucide-react'
import { Logo } from './BrandLogo'
import type { PersonalAccess } from '../lib/library-access'
import { openPersonalLibrary } from '../lib/personal-login'

export function PersonalLibraryAccess({
  access,
  onAuthenticated,
}: {
  access: Exclude<PersonalAccess, null>
  onAuthenticated: () => void
}) {
  const [error, setError] = useState(
    access === 'invalid' ? 'O link pessoal está incompleto. Solicite seu link novamente.' : '',
  )
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    if (access === 'invalid') return
    let active = true
    openPersonalLibrary(access)
      .then(() => {
        if (active) onAuthenticated()
      })
      .catch((reason: unknown) => {
        if (active)
          setError(reason instanceof Error ? reason.message : 'Não foi possível abrir seu acesso.')
      })
    return () => {
      active = false
    }
  }, [access, attempt, onAuthenticated])
  return (
    <div className="checkout-page">
      <header className="checkout-page-header">
        <Logo href="/" />
        <span>MINHA BIBLIOTECA</span>
      </header>
      <main className="checkout-status-card">
        <h1>Abrindo sua biblioteca.</h1>
        {error ? (
          <>
            <p role="alert" className="checkout-error">
              {error}
            </p>
            {access !== 'invalid' && (
              <button
                className="button button-primary"
                onClick={() => {
                  setError('')
                  setAttempt((value) => value + 1)
                }}
              >
                Tentar novamente
              </button>
            )}
            <a href="/biblioteca" className="checkout-back">
              Solicitar meu link por e-mail
            </a>
          </>
        ) : (
          <p role="status">
            <LoaderCircle className="checkout-spinner" size={18} /> Preparando seu acesso pessoal…
          </p>
        )}
      </main>
    </div>
  )
}
