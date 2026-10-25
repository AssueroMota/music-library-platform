import type { Instrument, Plan, Track } from '../types'
import { violinOffers } from '../../shared/products'

export const allInstruments: Instrument[] = [
  {
    id: 'violin',
    name: 'Violino',
    description: 'Expressão em cada arco.',
    tuning: 'Afinação em Dó',
    detail: 'Melodias, estudos e repertórios para explorar a expressividade das cordas.',
    imageIndex: 0,
  },
  {
    id: 'saxophone',
    name: 'Saxofone',
    description: 'O seu som em evidência.',
    tuning: 'Alto em Mi♭ e tenor em Si♭',
    detail:
      'A proposta inclui arranjos para sax alto e tenor, com a transposição indicada em cada material.',
    imageIndex: 1,
  },
  {
    id: 'flute',
    name: 'Flauta transversal',
    description: 'Leveza que preenche o palco.',
    tuning: 'Afinação em Dó',
    detail: 'Um espaço para melodias cantáveis, sonoridade e prática de fraseado.',
    imageIndex: 2,
  },
  {
    id: 'guitar',
    name: 'Violão',
    description: 'Novas histórias em seis cordas.',
    tuning: 'Afinação padrão',
    detail: 'A futura coleção reunirá peças solo, melodias e acompanhamentos para seis cordas.',
    imageIndex: 3,
  },
  {
    id: 'viola',
    name: 'Viola de arco',
    description: 'Profundidade em cada nota.',
    tuning: 'Clave de Dó',
    detail:
      'Materiais pensados para a tessitura da viola, com leitura em clave de Dó na futura biblioteca.',
    imageIndex: 4,
  },
  {
    id: 'cello',
    name: 'Violoncelo',
    description: 'Presença que emociona.',
    tuning: 'Clave de Fá',
    detail: 'Repertórios planejados para valorizar a amplitude e o caráter do violoncelo.',
    imageIndex: 5,
  },
]

export const instruments = allInstruments.filter((instrument) => instrument.id === 'violin')

const pieces = [
  {
    slug: 'primeira-luz',
    title: 'Primeira luz',
    key: 'Dó maior',
    style: 'Contemporâneo' as const,
    bpm: 80,
    scoreNotes: [0, 2, 4, 7, 5, 4, 2, 0, 2, 4, 5, 9, 7, 5, 4, 0],
  },
  {
    slug: 'passo-sereno',
    title: 'Passo sereno',
    key: 'Lá menor',
    style: 'Estudo' as const,
    bpm: 96,
    scoreNotes: [9, 7, 5, 4, 2, 4, 5, 7, 9, 7, 5, 4, 2, 4, 7, 9],
  },
]

export const tracks: Track[] = instruments.flatMap((instrument) =>
  pieces.map((piece) => ({
    id: `${instrument.id}-${piece.slug}`,
    title: piece.title,
    composer: 'Estudo original · demonstração',
    instrument: instrument.id,
    style: piece.style,
    key: piece.key,
    bpm: piece.bpm,
    scoreNotes: piece.scoreNotes,
    audio: { backing: `/audio/${piece.slug}-backing.wav`, lead: `/audio/${piece.slug}-lead.wav` },
  })),
)

export const plans: Plan[] = [
  {
    id: 'basic',
    price: violinOffers[0].priceCents / 100,
    name: 'Plano Básico',
    description: 'Para ter a partitura em mãos e estudar no seu ritmo.',
    accessMode: 'Violino · somente partituras',
    benefits: [
      '25 partituras exclusivamente para violino',
      'Arquivos digitais organizados por música',
      'Acesso pelo computador, tablet ou celular',
      'Sem playbacks neste plano',
    ],
  },
  {
    id: 'complete',
    price: violinOffers[1].priceCents / 100,
    name: 'Plano Completo',
    description: 'Para abrir a partitura, dar o play e sentir a música acontecer.',
    accessMode: 'Violino · partituras + playbacks',
    featured: true,
    benefits: [
      '100 partituras exclusivamente para violino',
      'Playbacks para acompanhar sua interpretação',
      'Partitura e acompanhamento na mesma biblioteca',
      'Acesso pelo computador, tablet ou celular',
    ],
  },
]
