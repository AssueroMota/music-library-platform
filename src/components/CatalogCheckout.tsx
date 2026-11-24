import { useState } from 'react'
import { ArrowLeft, ArrowRight, Headphones, Music2, Video } from 'lucide-react'
import { freeLibrary } from '../../shared/free-library'
import { violinCatalog } from '../data/catalog-songs'
import { catalogUrl, englishSite, languageUrl } from '../lib/site-language'
import { Logo } from './BrandLogo'
import { CheckoutDialog } from './CheckoutDialog'
import { FreeLibraryDialog } from './FreeLibraryDialog'
import { LanguageSwitch } from './LanguageSwitch'
import '../styles/catalog-checkout.css'

export function CatalogCheckout() {
  const params = new URLSearchParams(window.location.search)
  const song = violinCatalog.find(({ id }) => id === params.get('musica'))
  const [plan, setPlan] = useState(song?.hasScore ? 'basic' : 'complete')
  const [freeOpen, setFreeOpen] = useState(false)
  const search = new URLSearchParams()
  const query = params.get('q')?.slice(0, 120)
  if (query) search.set('q', query)
  const backUrl = catalogUrl() + (query ? '?' + search : '') + '#musicas'

  const trialDetails =
    freeLibrary.scores.some((title) => title === song?.title) && song?.hasScore
      ? 'A partitura e o playback desta música estão no teste grátis.'
      : freeLibrary.guidedScores.some((title) => title === song?.title) && song?.hasGuide
        ? 'A versão guiada desta música está no teste grátis.'
        : 'Conheça a biblioteca com uma seleção de partituras, playbacks e vídeos guiados.'

  return (
    <div className="catalog-checkout">
      <header className="catalog-checkout-header">
        <Logo light href={languageUrl('/', englishSite)} />
        <LanguageSwitch path="/checkout/partitura" suffix={window.location.search} />
      </header>
      <main className="catalog-checkout-main">
        <a className="catalog-checkout-back" href={backUrl}>
          <ArrowLeft size={17} aria-hidden="true" /> Voltar ao catálogo
        </a>
        {song ? (
          <div className="catalog-checkout-layout">
            <div className="catalog-checkout-song">
              <h1>{song.title}</h1>
              {song.artist && <p className="catalog-checkout-artist">{song.artist}</p>}
              <ul className="catalog-checkout-formats">
                {song.hasScore && (
                  <li>
                    <Music2 size={18} aria-hidden="true" /> Partitura para violino
                  </li>
                )}
                {song.hasPlayback && (
                  <li>
                    <Headphones size={18} aria-hidden="true" /> Playback no Plano Completo
                  </li>
                )}
                {song.hasGuide && (
                  <li>
                    <Video size={18} aria-hidden="true" /> Partitura guiada no Plano Completo
                  </li>
                )}
              </ul>
              <section className="catalog-trial" aria-labelledby="catalog-trial-title">
                <h2 id="catalog-trial-title">Teste grátis</h2>
                <p>{trialDetails}</p>
                <button
                  className="button button-primary"
                  type="button"
                  onClick={() => setFreeOpen(true)}
                >
                  Testar de graça <ArrowRight size={17} aria-hidden="true" />
                </button>
                <small>Sem pagamento ou cartão.</small>
              </section>
            </div>
            <CheckoutDialog plan={plan} inline onPlanChange={song.hasScore ? setPlan : undefined} />
          </div>
        ) : (
          <h1>Música não encontrada</h1>
        )}
      </main>
      <FreeLibraryDialog open={freeOpen} onClose={() => setFreeOpen(false)} />
    </div>
  )
}
