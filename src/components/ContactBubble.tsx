import { useEffect, useId, useRef, useState } from 'react'
import { Mail, MessageCircle, Send, X } from 'lucide-react'
import { supportEmail, supportMailto } from '../data/contact'
import '../styles/contact-bubble.css'

export function ContactBubble({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const id = useId()
  const messageRef = useRef<HTMLTextAreaElement>(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!open) return
    const previousFocus = document.activeElement
    messageRef.current?.focus()
    return () => {
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus()
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const close = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onOpenChange(false)
      }
    }
    document.addEventListener('keydown', close)
    return () => document.removeEventListener('keydown', close)
  }, [open, onOpenChange])

  return (
    <aside className="support-contact" aria-label="Contato com o suporte">
      {open && (
        <section
          id={`${id}-panel`}
          className="support-panel"
          role="dialog"
          aria-labelledby={`${id}-title`}
        >
          <header className="support-panel-heading">
            <span>
              <Mail size={17} /> MUSIC LIBRARY
            </span>
            <button type="button" aria-label="Fechar contato" onClick={() => onOpenChange(false)}>
              <X size={21} />
            </button>
            <h2 id={`${id}-title`}>Como podemos ajudar?</h2>
            <p>Tire suas dúvidas sobre os planos, o material ou seu acesso.</p>
          </header>
          <div className="support-panel-body">
            <label htmlFor={`${id}-message`}>Qual é a sua dúvida?</label>
            <textarea
              id={`${id}-message`}
              ref={messageRef}
              rows={4}
              maxLength={2000}
              value={message}
              placeholder="Olá! Gostaria de saber mais sobre…"
              aria-invalid={error || undefined}
              aria-describedby={error ? `${id}-error` : `${id}-hint`}
              onChange={(event) => {
                setMessage(event.target.value)
                setError(false)
              }}
            />
            {error && (
              <p className="support-error" id={`${id}-error`} role="alert">
                Escreva sua dúvida antes de continuar.
              </p>
            )}
            <a
              className="support-send"
              href={supportMailto(message)}
              aria-disabled={!message.trim()}
              onClick={(event) => {
                if (!message.trim()) {
                  event.preventDefault()
                  setError(true)
                  messageRef.current?.focus()
                }
              }}
            >
              <Send size={18} /> Enviar por e-mail
            </a>
            <p className="support-hint" id={`${id}-hint`}>
              Seu aplicativo de e-mail será aberto para concluir o envio.
            </p>
            <div className="support-address">
              <span>Ou escreva diretamente para</span>
              <a href={supportMailto()}>{supportEmail}</a>
            </div>
          </div>
        </section>
      )}
      <button
        type="button"
        className="support-launcher"
        aria-expanded={open}
        aria-controls={open ? `${id}-panel` : undefined}
        aria-label={open ? 'Fechar contato com o suporte' : 'Entrar em contato com o suporte'}
        onClick={() => onOpenChange(!open)}
      >
        <span className="support-launcher-label">
          Precisa de ajuda?<small>Fale com a gente</small>
        </span>
        <span className="support-launcher-icon">
          {open ? <X size={25} /> : <MessageCircle size={27} />}
        </span>
      </button>
    </aside>
  )
}
