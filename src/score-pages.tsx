/* oxlint-disable react/only-export-components -- These components render static HTML on the server. */
import type { ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { violinDemonstration as demo } from './data/demonstration'
import { scorePages, type ScorePage } from './data/score-pages'

const origin = 'https://www.partiturasebases.com.br'
const catalogPath = '/partituras-para-violino'
const catalogName = 'Partituras para violino'
const logo = '/images/music-library-violinista-transparent.png'
const image = `${origin}/images/violin-cover.jpg`

const songPath = (score: ScorePage) => `${catalogPath}/${score.slug}`

function availableFormats(score: ScorePage) {
  return [
    score.hasScore && 'Partitura',
    score.hasPlayback && 'Playback',
    score.hasGuide && 'Partitura guiada em vídeo',
  ].filter(Boolean)
}

function ScoreLinks({ scores }: { scores: readonly ScorePage[] }) {
  return (
    <ul className="examples score-list">
      {scores.map((score) => (
        <li key={score.slug}>
          <h3>
            <a href={songPath(score)}>{score.title}</a>
          </h3>
          <p>
            {score.artist} · {score.style}
          </p>
          <p className="score-formats">{availableFormats(score).join(' · ')}</p>
        </li>
      ))}
    </ul>
  )
}

function Catalog() {
  return (
    <article>
      <header className="intro">
        <h1>{catalogName} por música</h1>
        <p>
          Veja uma seleção do acervo da Music Library. Abra a música para conferir os formatos
          disponíveis e ler dicas de ensaio para violino.
        </p>
      </header>
      <section aria-labelledby="musicas">
        <h2 id="musicas">Músicas do acervo</h2>
        <ScoreLinks scores={scorePages} />
      </section>
      <section className="next" aria-labelledby="biblioteca-completa">
        <h2 id="biblioteca-completa">Explore a biblioteca</h2>
        <a className="action" href="/#biblioteca">
          Consultar o acervo por título ou artista
        </a>
        <a href="/repertorio-para-violino">Montar repertório por ocasião</a>
      </section>
    </article>
  )
}

function PublicSample() {
  return (
    <section aria-labelledby="demonstracao">
      <h2 id="demonstracao">Demonstração de A Thousand Years</h2>
      <p>
        {demo.key} · Compasso {demo.meter} · {demo.tempo}
      </p>
      <div className="examples score-demo">
        <div>
          <h3>Partitura para violino</h3>
          <a href={demo.score}>
            <img
              src={demo.score}
              width={demo.scoreWidth}
              height={demo.scoreHeight}
              loading="lazy"
              alt="Página de demonstração da partitura de A Thousand Years para violino"
            />
            Abrir partitura em tamanho original
          </a>
        </div>
        <div>
          <h3>Playback de demonstração</h3>
          <audio
            controls
            preload="none"
            src={demo.backing}
            aria-label="Playback de A Thousand Years"
          >
            <a href={demo.backing}>Ouvir o playback</a>
          </audio>
        </div>
      </div>
    </section>
  )
}

function Song({ score, heading }: { score: ScorePage; heading: string }) {
  const related = scorePages
    .filter((item) => item !== score && item.style === score.style)
    .slice(0, 3)
  return (
    <article>
      <header className="intro">
        <h1>{heading}</h1>
        <p className="score-artist">
          {score.artist} · {score.style}
        </p>
        <p>{score.introduction}</p>
      </header>
      <section aria-labelledby="formatos">
        <h2 id="formatos">Onde encontrar a música</h2>
        <ul className="steps">
          {score.hasScore && (
            <li>
              <strong>Partitura para violino.</strong> Incluída nos planos Básico e Completo.
            </li>
          )}
          {score.hasPlayback && (
            <li>
              <strong>Playback para ensaiar.</strong> Incluído no Plano Completo.
            </li>
          )}
          {score.hasGuide && (
            <li>
              <strong>Partitura guiada em vídeo.</strong> Incluída no Plano Completo.{' '}
              <a href="/partituras-guiadas-para-violino">Veja como estudar com o vídeo.</a>
            </li>
          )}
        </ul>
      </section>
      {score.title === demo.title && score.artist === demo.artist && <PublicSample />}
      <section aria-labelledby="ensaio">
        <h2 id="ensaio">Como ensaiar no violino</h2>
        <ol className="steps">
          {score.practice.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ol>
      </section>
      <section className="next" aria-labelledby="acesso">
        <h2 id="acesso">Acesse o acervo da Music Library</h2>
        <a className="action" href={score.hasScore ? '/#planos' : '/#plano-complete'}>
          {score.hasScore ? 'Ver planos' : 'Conhecer o Plano Completo'}
        </a>
        <a href="/biblioteca">Entrar na biblioteca</a>
      </section>
      {related.length > 0 && (
        <section aria-labelledby="relacionadas">
          <h2 id="relacionadas">Mais músicas de {score.style}</h2>
          <ScoreLinks scores={related} />
        </section>
      )}
    </article>
  )
}

function renderPage(
  path: string,
  title: string,
  description: string,
  body: ReactNode,
  score?: ScorePage,
) {
  const url = origin + path
  const trail = [
    { name: 'Music Library', path: '/' },
    { name: catalogName, path: catalogPath },
    ...(score ? [{ name: score.title, path }] : []),
  ]
  const breadcrumbs = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map(({ name, path }, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name,
      item: origin + path,
    })),
  }).replaceAll('<', '\\u003c')

  return {
    path,
    url,
    head: renderToStaticMarkup(
      <>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={url} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Music Library" />
        <meta property="og:locale" content="pt_BR" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={url} />
        <meta property="og:image" content={image} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumbs }} />
      </>,
    ),
    body: renderToStaticMarkup(
      <>
        <a className="skip" href="#conteudo">
          Pular para o conteúdo
        </a>
        <header className="guide-header">
          <div className="wrap">
            <a href="/" aria-label="Music Library — início">
              <img src={logo} alt="Music Library" width="72" height="72" />
            </a>
            <a className="action" href="/#planos">
              Ver planos
            </a>
          </div>
        </header>
        <main id="conteudo" className="wrap" tabIndex={-1}>
          <nav className="breadcrumbs" aria-label="Você está aqui">
            <ol>
              {trail.map(({ name, path }, index) =>
                index === trail.length - 1 ? (
                  <li key={path} aria-current="page">
                    {name}
                  </li>
                ) : (
                  <li key={path}>
                    <a href={path}>{name}</a>
                  </li>
                ),
              )}
            </ol>
          </nav>
          {body}
        </main>
        <footer className="guide-footer">
          <div className="wrap">
            <a href={catalogPath}>Partituras para violino por música</a>
          </div>
        </footer>
      </>,
    ),
  }
}

function renderCatalogPage() {
  return renderPage(
    catalogPath,
    'Partituras para violino por música | Music Library',
    'Encontre partituras para violino por música e artista. Confira os playbacks, os vídeos guiados e as dicas de ensaio da Music Library.',
    <Catalog />,
  )
}

function renderSongPage(score: ScorePage) {
  const format = score.hasScore ? 'partitura para violino' : 'partitura guiada para violino'
  const heading = `${score.title} – ${format}`
  const alternateTitle = score.alternateTitle ? ` (${score.alternateTitle})` : ''
  const description = `Veja os formatos de ${score.title}${alternateTitle}, de ${score.artist}, para violino. ${availableFormats(score).join(', ')} e dicas de ensaio na Music Library.`
  return renderPage(
    songPath(score),
    `${score.title} (${score.artist}) – ${format}`,
    description,
    <Song score={score} heading={heading} />,
    score,
  )
}

export function renderScorePage(path: string) {
  if (path === catalogPath) return renderCatalogPage()
  const score = scorePages.find((item) => songPath(item) === path)
  return score && renderSongPage(score)
}

export function renderScorePages() {
  return [renderCatalogPage(), ...scorePages.map(renderSongPage)]
}

export function fillScorePage(template: string, page: { head: string; body: string }) {
  return template
    .replace('<!-- score-page-head -->', () => page.head)
    .replace('<!-- score-page-body -->', () => page.body)
}
