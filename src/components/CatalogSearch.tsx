import { Search } from 'lucide-react'
import { catalogUrl, englishSite } from '../lib/site-language'

export function CatalogSearch({ english = englishSite }: { english?: boolean }) {
  return (
    <form
      className="catalog-search"
      role="search"
      action={catalogUrl(english) + '#musicas'}
      aria-label={english ? 'Search sheet music' : 'Busca de partituras'}
    >
      <input
        type="search"
        name="q"
        aria-label={english ? 'Search by song or artist' : 'Buscar por música ou artista'}
        placeholder={english ? 'Song or artist' : 'Música ou artista'}
        maxLength={120}
      />
      <button type="submit" aria-label={english ? 'Search the catalog' : 'Buscar no catálogo'}>
        <Search size={19} aria-hidden="true" />
      </button>
    </form>
  )
}
