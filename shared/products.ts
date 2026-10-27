// Seed/base catalog. Checkout reads PostgreSQL and applies the shared launch schedule.
export const catalog = [
  {
    id: 'library-violin',
    code: 'ML-VIOLIN',
    name: 'Biblioteca de Violino',
    instrument: 'violin',
    priceCents: 1790,
  },
  {
    id: 'library-saxophone',
    code: 'ML-SAXOPHONE',
    name: 'Biblioteca de Saxofone',
    instrument: 'saxophone',
    priceCents: 1790,
  },
  {
    id: 'library-flute',
    code: 'ML-FLUTE',
    name: 'Biblioteca de Flauta',
    instrument: 'flute',
    priceCents: 1790,
  },
  {
    id: 'library-guitar',
    code: 'ML-GUITAR',
    name: 'Biblioteca de Violão',
    instrument: 'guitar',
    priceCents: 1790,
  },
  {
    id: 'library-viola',
    code: 'ML-VIOLA',
    name: 'Biblioteca de Viola',
    instrument: 'viola',
    priceCents: 1790,
  },
  {
    id: 'library-cello',
    code: 'ML-CELLO',
    name: 'Biblioteca de Violoncelo',
    instrument: 'cello',
    priceCents: 1790,
  },
  {
    id: 'library-complete',
    code: 'ML-COMPLETE',
    name: 'Acesso Completo',
    instrument: null,
    priceCents: 2790,
  },
] as const

export const formatBRL = (cents: number) =>
  (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

// New products preserve the terms of existing purchases in the legacy catalog.
export const violinOffers = [
  {
    id: 'library-violin-scores',
    code: 'ML-VIOLIN-SCORES',
    name: 'Violino · Partituras',
    instrument: 'violin',
    accessType: 'SCORES',
    priceCents: 1290,
    description:
      'Coleção de 100 partituras para violino, em expansão. 10 setlists prontos e acesso vitalício. Não inclui playbacks.',
  },
  {
    id: 'library-violin-playbacks',
    code: 'ML-VIOLIN-PLAYBACKS',
    name: 'Violino · Partituras + Playbacks',
    instrument: 'violin',
    accessType: 'INSTRUMENT',
    priceCents: 2790,
    description:
      'Coleção de 100 partituras para violino com playbacks, em expansão. 10 setlists prontos e acesso vitalício.',
  },
] as const
