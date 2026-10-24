import { useEffect, useState, type FormEvent } from 'react'
import { LoaderCircle, LogOut, Mail, Music2 } from 'lucide-react'
import type { Session } from '@supabase/supabase-js'
import { auth } from '../lib/auth'
import { api } from '../lib/api'
import type { MemberLibraryData } from '../../shared/library'
import { MemberRepertoire } from './MemberRepertoire'

export function MemberLibrary() {
  const [session, setSession] = useState<Session | null>(null)
  const [checking, setChecking] = useState(true)
  const [email, setEmail] = useState('')
  const [data, setData] = useState<MemberLibraryData | null>(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)
  const [refresh, setRefresh] = useState(0)
  useEffect(() => {
    document.title = 'Minha biblioteca | Music Library'
    if (!auth) {
      setChecking(false)
      return
    }
    let mounted = true
    auth.auth
      .getSession()
      .then(({ data, error }) => {
        if (mounted) {
          setSession(data.session)
          setChecking(false)
          if (error) setError('O link expirou ou é inválido. Solicite um novo acesso.')
        }
      })
      .catch(() => {
        if (mounted) {
          setError('Não foi possível verificar sua sessão.')
          setChecking(false)
        }
      })
    const { data: listener } = auth.auth.onAuthStateChange((_event, current) => {
      setSession(current)
      setData(null)
      setError('')
    })
    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, [])
  useEffect(() => {
    if (!session) return
    const controller = new AbortController()
    setError('')
    api<MemberLibraryData>('/library', {
      headers: { Authorization: `Bearer ${session.access_token}` },
      signal: controller.signal,
    })
      .then(setData)
      .catch((e: Error) => {
        if (!controller.signal.aborted) setError(e.message)
      })
    return () => controller.abort()
  }, [session, refresh])
  async function login(event: FormEvent) {
    event.preventDefault()
    if (busy) return
    setBusy(true)
    setError('')
    setNotice('')
    try {
      const result = await api<{ message: string }>('/auth/link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      setNotice(result.message)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível enviar o link.')
    } finally {
      setBusy(false)
    }
  }
  return (
    <div className="checkout-page">
      <header className="checkout-page-header">
        <a href="/" className="member-brand">
          <Music2 size={24} /> music library.
        </a>
        <span>MINHA BIBLIOTECA</span>
        {session && (
          <button
            onClick={async () => {
              await auth?.auth.signOut()
              setSession(null)
              setData(null)
            }}
          >
            <LogOut size={16} /> Sair
          </button>
        )}
      </header>
      <main className={`checkout-status-card ${session ? 'member-library' : ''}`}>
        <span className="eyebrow">SEU ESPAÇO PARA TOCAR</span>
        <h1>{session ? 'Minha biblioteca.' : 'Seu repertório espera por você.'}</h1>
        {session && (
          <p>Encontre sua música, ouça o acompanhamento e abra a partitura para tocar.</p>
        )}
        {checking ? (
          <p role="status">
            <LoaderCircle className="checkout-spinner" /> Verificando seu acesso…
          </p>
        ) : !session ? (
          <>
            <p>
              Entre com o e-mail informado na sua compra. Enviaremos um link pessoal para acessar
              seus materiais.
            </p>
            <form onSubmit={login} className="member-login">
              <label htmlFor="member-email">Seu e-mail</label>
              <input
                id="member-email"
                type="email"
                autoComplete="email"
                required
                maxLength={254}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@email.com"
              />
              <button className="button button-primary" disabled={busy || !auth}>
                {busy ? (
                  <LoaderCircle className="checkout-spinner" size={17} />
                ) : (
                  <Mail size={17} />
                )}
                {busy ? 'Enviando…' : 'Receber link de acesso'}
              </button>
            </form>
            {!auth && (
              <p className="checkout-notice">
                O acesso à biblioteca está temporariamente indisponível. Tente novamente em
                instantes.
              </p>
            )}
          </>
        ) : (
          <>
            {data && (
              <>
                <div className="member-products">
                  {data.products.map((p) => (
                    <span key={p.id}>{p.name}</span>
                  ))}
                </div>
                <MemberRepertoire data={data} token={session.access_token} />
              </>
            )}
            {!data && !error && <p role="status">Carregando seus materiais…</p>}
            {error && (
              <button className="button button-outline" onClick={() => setRefresh((v) => v + 1)}>
                Tentar novamente
              </button>
            )}
          </>
        )}
        {error && (
          <p className="checkout-error" role="alert">
            {error}
          </p>
        )}
        {notice && (
          <p className="checkout-notice" role="status">
            {notice}
          </p>
        )}
        <a className="checkout-back" href="/#planos">
          Voltar ao site
        </a>
      </main>
    </div>
  )
}
