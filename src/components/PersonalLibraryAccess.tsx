import { useEffect, useState } from 'react'
import { LoaderCircle, Music2 } from 'lucide-react'
import { redeemPersonalAccess, trustedLoginUrl, type PersonalAccess } from '../lib/library-access'

export function PersonalLibraryAccess({ access }: { access: Exclude<PersonalAccess, null> }) {
  const [error, setError] = useState(
    access === 'invalid' ? 'O link pessoal está incompleto. Solicite seu link novamente.' : '',
  )
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    if (access === 'invalid') return
    let active = true
    redeemPersonalAccess(access)
      .then(({ url }) => {
        if (active) window.location.replace(trustedLoginUrl(url))
      })
      .catch((reason: unknown) => {
        if (active)
          setError(reason instanceof Error ? reason.message : 'Não foi possível abrir seu acesso.')
      })
    return () => {
      active = false
    }
  }, [access, attempt])
  return (
    <div className="checkout-page">
      <header className="checkout-page-header">
        <a href="/" className="member-brand">
          <Music2 size={24} /> music library.
        </a>
        <span>MINHA BIBLIOTECA</span>
      </header>
      <main className="checkout-status-card">
        <span className="eyebrow">SEU ESPAÇO PARA TOCAR</span>
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
