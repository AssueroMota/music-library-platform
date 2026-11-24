/* oxlint-disable react/only-export-components -- These components render static HTML on the server. */
import type { ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { freeLibrary } from '../shared/free-library'
import { violinDemonstration as demo } from './data/demonstration'
import { scorePages, type ScorePage } from './data/score-pages'

const origin = 'https://www.partiturasebases.com.br'
const catalogPath = '/partituras-para-violino'
const englishCatalogPath = '/violin-sheet-music'
const catalogName = 'Partituras para violino'
const englishCatalogName = 'Violin sheet music'
const logo = '/images/music-library-violinista-transparent.png'
const image = `${origin}/images/violin-cover.jpg`

const songPath = (score: ScorePage) => `${catalogPath}/${score.slug}`

function availableFormats(score: ScorePage, english = false) {
  return [
    score.hasScore && (english ? 'Violin score' : 'Partitura'),
    score.hasPlayback && (english ? 'Backing track' : 'Playback'),
    score.hasGuide && (english ? 'Play-along score video' : 'Partitura guiada em vídeo'),
  ].filter(Boolean)
}

function ScoreLinks({
  scores,
  english = false,
}: {
  scores: readonly ScorePage[]
  english?: boolean
}) {
  return (
    <ul className="examples score-list">
      {scores.map((score) => (
        <li key={score.slug}>
          <h3>
            <a
              href={(english ? '/en' : '') + songPath(score)}
              hrefLang={english ? 'en' : undefined}
            >
              {score.title}
            </a>
          </h3>
          {english ? (
            score.artist && <p>{score.artist}</p>
          ) : (
            <p>
              {score.artist ? `${score.artist} · ` : ''}
              {score.style}
            </p>
          )}
          <p className="score-formats">{availableFormats(score, english).join(' · ')}</p>
        </li>
      ))}
    </ul>
  )
}

function Catalog({ english }: { english: boolean }) {
  const alphabeticalScores = [...scorePages].sort((first, second) =>
    first.title.localeCompare(second.title, english ? 'en' : 'pt-BR'),
  )
  return (
    <article>
      <header className="intro">
        <h1>
          {english ? 'Violin sheet music with backing tracks' : 'Partituras de violino e playbacks'}
        </h1>
        <p>
          {english
            ? 'Find a violin score by song or artist. Browse wedding favorites, pop songs, Brazilian music and film themes. Check which songs have a backing track or a play-along score video.'
            : 'Encontre a partitura de violino da sua próxima música. Explore repertório para casamentos, MPB, gospel, pop e trilhas sonoras. Veja quais músicas têm playback ou partitura guiada em vídeo.'}
        </p>
        <p>
          <a href="#demonstracao">
            {english
              ? 'Try the free score and backing track'
              : 'Experimente partitura e playback grátis'}
          </a>
        </p>
        <a
          href={english ? catalogPath : englishCatalogPath}
          hrefLang={english ? 'pt-BR' : 'en'}
          lang={english ? 'pt-BR' : 'en'}
        >
          {english ? 'Português (Brasil)' : 'English'}
        </a>
      </header>
      <section aria-labelledby="musicas">
        <h2 id="musicas">{english ? 'Browse violin scores by song' : 'Procure uma música'}</h2>
        <ScoreLinks scores={alphabeticalScores} english={english} />
      </section>
      <PublicSample english={english} />
      <section className="next" aria-labelledby="biblioteca-completa">
        <h2 id="biblioteca-completa">{english ? 'Explore the library' : 'Explore a biblioteca'}</h2>
        <p>
          {english
            ? 'The Basic plan includes sheet music. The Complete plan also includes backing tracks and play-along score videos.'
            : 'O Plano Básico inclui partituras. O Completo também inclui playbacks e partituras guiadas em vídeo.'}
        </p>
        <a className="action" href={english ? '/en#biblioteca' : '/#biblioteca'}>
          {english ? 'Search the full library' : 'Consultar o acervo por título ou artista'}
        </a>
        <a href={english ? '/en/repertorio-para-violino' : '/repertorio-para-violino'}>
          {english ? 'Find violin repertoire by occasion' : 'Montar repertório por ocasião'}
        </a>
      </section>
    </article>
  )
}

function PublicSample({ english = false }: { english?: boolean }) {
  return (
    <section aria-labelledby="demonstracao">
      <h2 id="demonstracao">
        {english ? 'Free sample: A Thousand Years' : 'Demonstração de A Thousand Years'}
      </h2>
      <p>
        {english ? 'B♭ major' : demo.key} · {english ? 'Time signature' : 'Compasso'} {demo.meter} ·{' '}
        {demo.tempo}
      </p>
      <div className="examples score-demo">
        <div>
          <h3>{english ? 'Violin score' : 'Partitura para violino'}</h3>
          <a href={demo.score}>
            <img
              src={demo.score}
              width={demo.scoreWidth}
              height={demo.scoreHeight}
              loading="lazy"
              alt={
                english
                  ? 'A Thousand Years violin sheet music sample'
                  : 'Página de demonstração da partitura de A Thousand Years para violino'
              }
            />
            {english
              ? 'Open the full-size sheet music sample'
              : 'Abrir partitura em tamanho original'}
          </a>
        </div>
        <div>
          <h3>{english ? 'Sample backing track' : 'Playback de demonstração'}</h3>
          <audio
            controls
            preload="none"
            src={demo.backing}
            aria-label={english ? 'A Thousand Years backing track' : 'Playback de A Thousand Years'}
          >
            <a href={demo.backing}>
              {english ? 'Listen to the backing track' : 'Ouvir o playback'}
            </a>
          </audio>
        </div>
      </div>
    </section>
  )
}

function Song({ score, heading }: { score: ScorePage; heading: string }) {
  const hasPublicSample = score.title === demo.title && score.artist === demo.artist
  const trialMaterial = freeLibrary.guidedScores.some((title) => title === score.title)
    ? 'A partitura guiada está na seleção grátis da Music Library.'
    : freeLibrary.scores.some((title) => title === score.title)
      ? 'A partitura e o playback estão na seleção grátis da Music Library.'
      : null
  const related = scorePages
    .filter((item) => item !== score && item.style === score.style)
    .slice(0, 3)
  return (
    <article>
      <header className="intro">
        <h1>{heading}</h1>
        <p className="score-artist">
          {score.artist ? `${score.artist} · ` : ''}
          {score.style}
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
      {hasPublicSample && <PublicSample />}
      {trialMaterial && !hasPublicSample && (
        <section aria-labelledby="teste-gratis">
          <h2 id="teste-gratis">Experimente de graça</h2>
          <p>{trialMaterial} O acesso é enviado por e-mail.</p>
          <a className="action" href="/#teste-gratis">
            Ver opção Grátis
          </a>
        </section>
      )}
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
  const english = path === englishCatalogPath
  const lang = english ? 'en' : 'pt-BR'
  const trail = [
    { name: 'Music Library', path: '/' },
    {
      name: english ? englishCatalogName : catalogName,
      path: english ? englishCatalogPath : catalogPath,
    },
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
    lang,
    head: renderToStaticMarkup(
      <>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={url} />
        {!score && (
          <>
            <link rel="alternate" hrefLang="pt-BR" href={origin + catalogPath} />
            <link rel="alternate" hrefLang="en" href={origin + englishCatalogPath} />
          </>
        )}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Music Library" />
        <meta property="og:locale" content={english ? 'en_US' : 'pt_BR'} />
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
          {english ? 'Skip to content' : 'Pular para o conteúdo'}
        </a>
        <header className="guide-header">
          <div className="wrap">
            <a
              href={english ? '/en' : '/'}
              aria-label={english ? 'Music Library home' : 'Music Library — início'}
            >
              <img src={logo} alt="Music Library" width="72" height="72" />
            </a>
            <a className="action" href={english ? '/en#planos' : '/#planos'}>
              {english ? 'View plans' : 'Ver planos'}
            </a>
          </div>
        </header>
        <main id="conteudo" className="wrap" tabIndex={-1}>
          <nav className="breadcrumbs" aria-label={english ? 'Breadcrumb' : 'Você está aqui'}>
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
            <a href={catalogPath} hrefLang="pt-BR" lang="pt-BR">
              Partituras para violino por música
            </a>
          </div>
        </footer>
      </>,
    ),
  }
}

function renderCatalogPage(english = false) {
  return renderPage(
    english ? englishCatalogPath : catalogPath,
    english
      ? 'Violin Sheet Music & Backing Tracks | Music Library'
      : 'Partituras de violino com playback | Music Library',
    english
      ? 'Find a violin score by song or artist. Browse backing tracks and play-along videos, or try the free A Thousand Years sheet music sample.'
      : 'Encontre a partitura de violino da sua música favorita. Veja playbacks e vídeos guiados e experimente grátis a partitura e o playback de A Thousand Years.',
    <Catalog english={english} />,
  )
}

function renderSongPage(score: ScorePage) {
  const format = score.hasScore ? 'partitura para violino' : 'partitura guiada para violino'
  const heading = `${score.title} – ${format}`
  const alternateTitle = score.alternateTitle ? ` (${score.alternateTitle})` : ''
  const attribution = score.artist ? `, de ${score.artist},` : ''
  const description = `Conheça ${score.title}${alternateTitle}${attribution} no violino. ${availableFormats(score).join(', ')} e dicas de ensaio na Music Library.`
  return renderPage(
    songPath(score),
    `${score.title}${score.artist ? ` (${score.artist})` : ''} – ${format}${score.hasPlayback ? ' com playback' : ''}`,
    description,
    <Song score={score} heading={heading} />,
    score,
  )
}

export function renderScorePage(path: string) {
  if (path === catalogPath) return renderCatalogPage()
  if (path === englishCatalogPath) return renderCatalogPage(true)
  const score = scorePages.find((item) => songPath(item) === path)
  return score && renderSongPage(score)
}

export function renderScorePages() {
  return [renderCatalogPage(), renderCatalogPage(true), ...scorePages.map(renderSongPage)]
}

export function fillScorePage(
  template: string,
  page: { head: string; body: string; lang: string },
) {
  return template
    .replace('<html lang="pt-BR">', () => `<html lang="${page.lang}">`)
    .replace('<!-- score-page-head -->', () => page.head)
    .replace('<!-- score-page-body -->', () => page.body)
}
