import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from 'react'
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  Copy,
  LoaderCircle,
  LogOut,
  Mail,
  ShieldCheck,
} from 'lucide-react'
import type { Session } from '@supabase/supabase-js'
import { auth } from '../lib/auth'
import { api, LIBRARY_REQUEST_TIMEOUT_MS } from '../lib/api'
import type { MemberLibraryData } from '../../shared/library'
import type { UpgradeQuote } from '../../shared/upgrade'
import { formatBRL } from '../../shared/products'
import { MemberRepertoire } from './MemberRepertoire'
import { readPersonalAccess } from '../lib/library-access'
import { PersonalLibraryAccess } from './PersonalLibraryAccess'
import { Logo } from './BrandLogo'
const LibraryUpgrade = lazy(() =>
  import('./LibraryUpgrade').then((module) => ({ default: module.LibraryUpgrade })),
)

export function MemberLibrary() {
  const [access, setAccess] = useState(() => readPersonalAccess(window.location.hash))
  const [basicPreview, setBasicPreview] = useState(
    () => new URLSearchParams(window.location.search).get('visualizar') === 'basico',
  )
  const authenticated = useCallback(() => {
    window.history.replaceState(
      {},
      '',
      basicPreview ? '/biblioteca?visualizar=basico' : '/biblioteca',
    )
    setAccess(null)
  }, [basicPreview])
  return access ? (
    <PersonalLibraryAccess access={access} onAuthenticated={authenticated} />
  ) : (
    <MemberLibraryContent
      basicPreview={basicPreview}
      onComplete={() => {
        window.history.replaceState({}, '', '/biblioteca')
        setBasicPreview(false)
      }}
    />
  )
}

function MemberLibraryContent({
  basicPreview,
  onComplete,
}: {
  basicPreview: boolean
  onComplete: () => void
}) {
  const [session, setSession] = useState<Session | null>(null)
  const currentSession = useRef<Session | null>(null)
  const userId = session?.user.id
  const [checking, setChecking] = useState(true)
  const [email, setEmail] = useState('')
  const [data, setData] = useState<MemberLibraryData | null>(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)
  const [refresh, setRefresh] = useState(0)
  const [waitingLonger, setWaitingLonger] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)
  const [upgradeOpen, setUpgradeOpen] = useState(false)
  const completeAccess = Boolean(
    data && (data.setlistLimit === 42 || data.assets.some((asset) => asset.kind === 'audio')),
  )
  const showUpgrade = Boolean(
    session && data && (basicPreview || !completeAccess) && data.assets.length,
  )
  function refreshUpgrade() {
    setUpgradeOpen(false)
    onComplete()
    setRefresh((value) => value + 1)
  }
  useEffect(() => {
    if (!userId) return
    const marker = `ml:upgrade-pending:${userId}`
    if (completeAccess) {
      sessionStorage.removeItem(marker)
      return
    }
    function checkUpgrade() {
      if (document.visibilityState === 'visible' && sessionStorage.getItem(marker))
        setRefresh((value) => value + 1)
    }
    window.addEventListener('focus', checkUpgrade)
    return () => window.removeEventListener('focus', checkUpgrade)
  }, [userId, completeAccess])
  // A Complete member can inspect the Basic presentation without changing their rights.
  // This view only removes materials; authorization remains enforced by the API.
  const repertoireData = useMemo<MemberLibraryData | null>(
    () =>
      data && basicPreview
        ? {
            ...data,
            setlistLimit: 10,
            assets: data.assets.filter((asset) => asset.kind === 'score'),
          }
        : data,
    [data, basicPreview],
  )
  useEffect(() => {
    document.title = 'Minha biblioteca | Music Library'
    if (!auth) {
      setChecking(false)
      return
    }
    let mounted = true
    let receivedAuthEvent = false
    function updateSession(next: Session | null) {
      if (!mounted) return
      const changedAccount = currentSession.current?.user.id !== next?.user.id
      currentSession.current = next
      setSession(next)
      setChecking(false)
      // SIGNED_IN can fire on tab focus; renewing the same account must not
      // unmount the repertoire, discard filters or interrupt an open score.
      if (changedAccount) {
        setData(null)
        setError('')
        setNotice('')
        setLinkCopied(false)
        setUpgradeOpen(false)
      }
    }
    auth.auth
      .getSession()
      .then(({ data, error }) => {
        if (mounted && !receivedAuthEvent) {
          updateSession(data.session)
          if (error) setError('O link expirou ou é inválido. Solicite um novo acesso.')
        }
      })
      .catch(() => {
        if (mounted && !receivedAuthEvent) {
          setError('Não foi possível verificar sua sessão.')
          setChecking(false)
        }
      })
    const { data: listener } = auth.auth.onAuthStateChange((_event, current) => {
      receivedAuthEvent = true
      updateSession(current)
    })
    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, [])
  useEffect(() => {
    const activeSession = currentSession.current
    if (!activeSession || activeSession.user.id !== userId) return
    const controller = new AbortController()
    setError('')
    setWaitingLonger(false)
    const timer = setTimeout(() => setWaitingLonger(true), 8000)
    api<MemberLibraryData>(
      '/library',
      {
        headers: { Authorization: `Bearer ${activeSession.access_token}` },
        signal: controller.signal,
      },
      LIBRARY_REQUEST_TIMEOUT_MS,
    )
      .then((result) => {
        if (!controller.signal.aborted) setData(result)
      })
      .catch((e: Error) => {
        if (!controller.signal.aborted) setError(e.message)
      })
      .finally(() => clearTimeout(timer))
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [userId, refresh])
  async function login(event: FormEvent) {
    event.preventDefault()
    if (busy) return
    setBusy(true)
    setError('')
    setNotice('')
    try {
      const result = await api<{ message: string }>(
        '/auth/link',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim() }),
        },
        LIBRARY_REQUEST_TIMEOUT_MS,
      )
      setNotice(result.message)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível enviar o link.')
    } finally {
      setBusy(false)
    }
  }
  return (
    <div className={`checkout-page member-page ${session ? 'member-page-authenticated' : ''}`}>
      <header className="checkout-page-header">
        <Logo href="/" />
        <span className="member-header-label">
          <ShieldCheck size={16} /> Área do aluno
        </span>
        {session && (
          <button
            onClick={async () => {
              await auth?.auth.signOut()
              currentSession.current = null
              setSession(null)
              setData(null)
            }}
          >
            <LogOut size={16} /> Sair
          </button>
        )}
      </header>
      <main className={`checkout-status-card ${session ? 'member-library' : ''}`}>
        <div className="member-library-intro">
          <div>
            <h1>{session ? 'Minha biblioteca' : 'Seu repertório espera por você.'}</h1>
          </div>
          <div className="member-library-actions">
            {showUpgrade && (
              <UpgradeButton
                key={session!.user.id}
                token={session!.access_token}
                alreadyComplete={completeAccess}
                onOpen={() => setUpgradeOpen(true)}
              />
            )}
            {session && data?.personalLink && (
              <button
                className="member-access-link"
                aria-label="Copiar meu link pessoal"
                title="Copiar meu link pessoal"
                onClick={async () => {
                  try {
                    const link = new URL(data.personalLink!)
                    if (basicPreview) link.searchParams.set('visualizar', 'basico')
                    await navigator.clipboard.writeText(link.href)
                    setLinkCopied(true)
                    setNotice(
                      'Link copiado. Guarde nos favoritos e não compartilhe seu acesso pessoal.',
                    )
                  } catch {
                    setNotice('Não foi possível copiar. Seu link também está no e-mail da compra.')
                  }
                }}
              >
                {linkCopied ? <Check size={17} /> : <Copy size={17} />}
                <span>{linkCopied ? 'Link copiado' : 'Copiar meu acesso'}</span>
              </button>
            )}
          </div>
        </div>
        {checking ? (
          <p role="status">
            <LoaderCircle className="checkout-spinner" /> Verificando seu acesso…
          </p>
        ) : !session ? (
          <>
            <p>
              Informe o mesmo e-mail usado na compra. Enviaremos seu link pessoal para acessar seus
              materiais.
            </p>
            <p className="checkout-notice" id="member-email-help">
              <strong>Utilize um e-mail Gmail (@gmail.com).</strong> Informe o mesmo endereço na
              compra e no acesso à biblioteca para receber seu link pessoal.
            </p>
            <form onSubmit={login} className="member-login">
              <label htmlFor="member-email">Seu e-mail</label>
              <input
                id="member-email"
                type="email"
                autoComplete="email"
                aria-describedby="member-email-help"
                required
                maxLength={254}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@gmail.com"
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
                {Boolean(data.previewAccess?.length) && (
                  <p className="checkout-notice">
                    O acesso de teste está ativo. Você pode ouvir e visualizar os materiais
                    liberados.
                  </p>
                )}
                <MemberRepertoire data={repertoireData!} token={session.access_token} />
              </>
            )}
            {!data && !error && (
              <p role="status">
                <LoaderCircle className="checkout-spinner" size={18} />{' '}
                {waitingLonger
                  ? 'Estamos preparando seus materiais. Isso pode levar cerca de um minuto. Mantenha esta página aberta.'
                  : 'Carregando seus materiais…'}
              </p>
            )}
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
          <ArrowLeft size={15} /> Voltar ao site
        </a>
        {upgradeOpen && session && (
          <Suspense fallback={<p role="status">Abrindo upgrade…</p>}>
            <LibraryUpgrade
              token={session.access_token}
              userId={session.user.id}
              alreadyComplete={completeAccess}
              onRefresh={refreshUpgrade}
              onClose={() => setUpgradeOpen(false)}
            />
          </Suspense>
        )}
      </main>
    </div>
  )
}

function UpgradeButton({
  token,
  alreadyComplete,
  onOpen,
}: {
  token: string
  alreadyComplete: boolean
  onOpen: () => void
}) {
  const [quote, setQuote] = useState<UpgradeQuote | null>(null)
  useEffect(() => {
    if (alreadyComplete) return
    const controller = new AbortController()
    api<UpgradeQuote>(
      '/library/upgrade',
      { headers: { Authorization: `Bearer ${token}` }, signal: controller.signal },
      LIBRARY_REQUEST_TIMEOUT_MS,
    )
      .then((result) => {
        if (!controller.signal.aborted) setQuote(result)
      })
      .catch(() => {
        /* The modal offers retry; never invent a price on lookup failure. */
      })
    return () => controller.abort()
  }, [token, alreadyComplete])
  const price =
    alreadyComplete || quote?.alreadyComplete
      ? 0
      : quote && !quote.alreadyComplete
        ? quote.priceCents
        : null
  return (
    <button
      className="member-upgrade-button"
      onClick={onOpen}
      title={price === 0 ? 'Você já possui o Completo, sem nova cobrança.' : undefined}
    >
      <ArrowUpRight size={18} />
      Fazer upgrade{price !== null ? ` · ${formatBRL(price)}` : ''}
    </button>
  )
}
