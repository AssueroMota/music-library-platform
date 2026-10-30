import { Logo } from './BrandLogo'

export function LibraryLoading({
  phase = 'materials',
  waitingLonger = false,
}: {
  phase?: 'access' | 'materials'
  waitingLonger?: boolean
}) {
  const verifying = phase === 'access'
  return (
    <section className="library-entry" aria-label="Preparando sua biblioteca" aria-busy="true">
      <div className="library-entry-stage">
        <div className="library-entry-art" aria-hidden="true">
          <svg viewBox="0 0 760 260" fill="none" className="library-entry-score">
            <g className="library-entry-staff" stroke="currentColor" strokeWidth="1">
              {[0, 12, 24, 36, 48].map((offset) => (
                <path
                  key={offset}
                  d={`M-40 ${112 + offset} C135 ${12 + offset} 252 ${222 + offset} 380 ${112 + offset} S625 ${12 + offset} 800 ${112 + offset}`}
                />
              ))}
            </g>
            <path
              className="library-entry-melody"
              d="M-40 136 C135 36 252 246 380 136 S625 36 800 136"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray="4 18"
            />
            <g className="library-entry-note library-entry-note-one" fill="currentColor">
              <ellipse cx="167" cy="116" rx="9" ry="6" transform="rotate(-22 167 116)" />
              <path d="M174 115V76l22-5v36h-3V78l-16 4v33z" />
              <ellipse cx="187" cy="108" rx="9" ry="6" transform="rotate(-22 187 108)" />
            </g>
            <g className="library-entry-note library-entry-note-two" fill="currentColor">
              <ellipse cx="579" cy="119" rx="10" ry="7" transform="rotate(-22 579 119)" />
              <path d="M586 118V76h3c0 15 20 13 13 31-1-12-9-10-13-16v27z" />
            </g>
            <g className="library-entry-note library-entry-note-three" fill="currentColor">
              <ellipse cx="500" cy="201" rx="7" ry="5" transform="rotate(-22 500 201)" />
              <path d="M505 200v-31h3v31z" />
            </g>
            <g className="library-entry-record">
              <circle cx="380" cy="133" r="89" fill="#142538" stroke="#ffffff18" />
              {[77, 70, 63, 56].map((radius) => (
                <circle key={radius} cx="380" cy="133" r={radius} stroke="#ffffff0d" />
              ))}
              <path
                d="M319 95a72 72 0 0 1 43-31M402 202a72 72 0 0 0 39-30"
                stroke="#ec8655"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </g>
            <circle cx="380" cy="133" r="47" fill="#0c1929" stroke="#f28a5038" />
          </svg>
          <img
            className="library-entry-brand"
            src="/images/music-library-violinista-transparent.png"
            alt=""
            width="96"
            height="96"
          />
          <div className="library-entry-sound">
            {[14, 25, 38, 27, 45, 31, 38, 23, 14].map((height, index) => (
              <i key={index} style={{ height, animationDelay: `${index * -0.13}s` }} />
            ))}
          </div>
        </div>
        <div className="library-entry-copy">
          <span className="library-entry-eyebrow">MUSIC LIBRARY · ÁREA DO ALUNO</span>
          <h2 className="library-entry-title">
            {verifying ? 'Sua música começa aqui.' : 'Seu repertório está chegando.'}
          </h2>
          <p className="library-entry-status" role="status">
            {verifying
              ? 'Preparando seu acesso pessoal…'
              : waitingLonger
                ? 'Estamos preparando seus materiais. Mantenha esta página aberta; a biblioteca aparecerá assim que estiver pronta.'
                : 'Carregando seus materiais… Já já é só dar o play.'}
          </p>
          <div className="library-entry-steps" aria-hidden="true">
            <span className={verifying ? 'is-current' : 'is-complete'}>
              <i>{verifying ? '1' : '✓'}</i> Seu acesso
            </span>
            <b />
            <span className={verifying ? '' : 'is-current'}>
              <i>2</i> Seu repertório
            </span>
          </div>
        </div>
      </div>
      <div className="library-entry-preview" aria-hidden="true">
        <div className="library-entry-preview-heading">
          <span />
          <i />
          <i />
        </div>
        <div className="library-entry-preview-body">
          <div className="library-entry-preview-filters">
            <span />
            <span />
            <span />
          </div>
          <div className="library-entry-preview-list">
            {[0, 1, 2, 3].map((row) => (
              <div className="library-entry-preview-row" key={row}>
                <i />
                <span />
                <b />
                <b />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export function LibraryLoadingPage() {
  return (
    <div className="checkout-page member-page">
      <header className="checkout-page-header">
        <Logo href="/" />
        <span className="member-header-label">Área do aluno</span>
      </header>
      <main className="checkout-status-card member-library">
        <div className="member-library-intro">
          <h1>Minha biblioteca</h1>
        </div>
        <LibraryLoading phase="access" />
      </main>
    </div>
  )
}
