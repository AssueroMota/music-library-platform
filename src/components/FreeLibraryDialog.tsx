import { useEffect, useRef, useState, type FormEvent } from 'react'
import { CheckCircle2, ChevronLeft, LoaderCircle, Mail, X } from 'lucide-react'
import { api, LIBRARY_REQUEST_TIMEOUT_MS } from '../lib/api'
import { freeLibrary } from '../../shared/free-library'

export function FreeLibraryDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const busy = useRef(false)
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  useEffect(() => {
    if (!open) {
      dialog.current?.close()
      return
    }
    setMessage('')
    setError('')
    dialog.current?.showModal()
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [open])
  async function submit(event: FormEvent) {
    event.preventDefault()
    if (busy.current || message) return
    busy.current = true
    setSubmitting(true)
    setError('')
    try {
      const result = await api<{ message: string }>(
        '/library/free',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim().toLowerCase() }),
        },
        LIBRARY_REQUEST_TIMEOUT_MS,
      )
      setMessage(result.message)
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Não foi possível solicitar o acesso. Tente novamente.',
      )
    } finally {
      busy.current = false
      setSubmitting(false)
    }
  }
  return (
    <dialog
      ref={dialog}
      className="checkout-dialog free-library-dialog"
      aria-labelledby="free-library-title"
      onCancel={(event) => {
        event.preventDefault()
        if (!busy.current) onClose()
      }}
    >
      <form onSubmit={submit} className="checkout-dialog-body">
        <button
          type="button"
          className="checkout-close"
          aria-label="Fechar cadastro grátis"
          onClick={onClose}
          disabled={submitting}
        >
          <X size={21} />
        </button>
        <span className="eyebrow">CONHEÇA A MUSIC LIBRARY</span>
        <h2 id="free-library-title">
          Experimente <span>de graça.</span>
        </h2>
        <p className="checkout-intro">
          Receba seu link pessoal por e-mail e teste a biblioteca. Sem pagamento ou cartão.
        </p>
        <ul className="checkout-details">
          <li>
            <CheckCircle2 size={16} />
            <span>
              {freeLibrary.scoreCount} partituras com playback: {freeLibrary.scores.join(' e ')}.
            </span>
          </li>
          <li>
            <CheckCircle2 size={16} />
            <span>
              {freeLibrary.guidedScoreCount} guiadas em vídeo:{' '}
              {freeLibrary.guidedScores.join(' e ')}.
            </span>
          </li>
          <li>
            <CheckCircle2 size={16} />
            <span>Versão de teste sem setlists prontos ou personalizados.</span>
          </li>
        </ul>
        {message ? (
          <div className="checkout-notice" role="status">
            <strong>Agora confira seu e-mail.</strong>
            <p>{message}</p>
            <p>Seu link abre a área do aluno com os materiais do teste grátis.</p>
            <a href="/biblioteca" className="button button-outline">
              Já tenho acesso / reenviar meu link
            </a>
          </div>
        ) : (
          <>
            <div className="checkout-field">
              <label htmlFor="free-library-email">E-mail para receber seu acesso grátis</label>
              <input
                id="free-library-email"
                type="email"
                autoComplete="email"
                placeholder="voce@gmail.com"
                required
                maxLength={254}
                value={email}
                disabled={submitting}
                onChange={(event) => setEmail(event.target.value)}
              />
              <p className="checkout-intro">
                Use um endereço ao qual você tenha acesso. Enviaremos apenas o link solicitado.
              </p>
            </div>
            {error && (
              <p className="checkout-error" role="alert">
                {error}
              </p>
            )}
            <button
              type="submit"
              className="button button-primary checkout-submit"
              disabled={submitting || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())}
            >
              {submitting ? (
                <LoaderCircle size={18} className="checkout-spinner" />
              ) : (
                <Mail size={18} />
              )}
              {submitting ? 'Solicitando acesso…' : 'Receber meu acesso grátis'}
            </button>
          </>
        )}
        <button type="button" className="checkout-back" onClick={onClose} disabled={submitting}>
          <ChevronLeft size={15} />
          Voltar aos planos
        </button>
      </form>
    </dialog>
  )
}
