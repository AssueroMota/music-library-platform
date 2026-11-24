export const englishSite = import.meta.env.MODE === 'english'

const englishStyles: Record<string, string> = {
  Chanson: 'French chanson',
  Clássico: 'Classical',
  'Clássicos & Trilhas': 'Classical & soundtracks',
  MPB: 'Brazilian popular music',
  Natal: 'Christmas',
  'Pop internacional': 'International pop',
  'Rock internacional': 'International rock',
  'Rock nacional': 'Brazilian rock',
  'Trilha sonora': 'Soundtrack',
}

export function localizedStyle(style: string) {
  return englishSite && Object.hasOwn(englishStyles, style) ? englishStyles[style] : style
}

export function localizedProductName(name: string) {
  if (!englishSite) return name
  if (name === 'Violino · Partituras') return 'Violin · Sheet music'
  if (name === 'Violino · Partituras + Playbacks') return 'Violin · Sheet music and backing tracks'
  if (name === 'Biblioteca de Violino') return 'Violin library'
  return name
}

export function localPathname(pathname: string) {
  return pathname.replace(/^\/en(?=\/|$)/, '') || '/'
}

export function languageUrl(pathname: string, english: boolean) {
  const local = localPathname(pathname)
  if (local === '/violin-sheet-music' || local === '/partituras-para-violino') {
    return english ? '/violin-sheet-music' : '/partituras-para-violino'
  }
  return english ? `/en${local === '/' ? '' : local}` : local
}
