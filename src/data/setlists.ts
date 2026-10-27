import { normalizeSearch } from './library'

export const violinSetlists = [
  {
    id: 'cerimonia-romantica',
    title: 'Cerimônia romântica',
    occasion: 'Casamentos',
    description: 'Uma sequência delicada para entradas e momentos de celebração.',
    titles: [
      'A Thousand Years',
      "Can't Help Falling in Love",
      'Perfect',
      'All of Me',
      'Thinking Out Loud',
      'Until I Found You',
      'La Vie en Rose',
      'Lucky',
    ],
  },
  {
    id: 'recepcao-brasileira',
    title: 'Recepção brasileira',
    occasion: 'Recepções',
    description: 'Canções brasileiras para receber os convidados com afeto.',
    titles: [
      'Trevo (Tu)',
      'É Você',
      'Velha Infância',
      'De Janeiro a Janeiro',
      'Como É Grande o Meu Amor por Você',
      'Eu Sei Que Vou Te Amar',
      'Pra Sonhar',
      'Vilarejo',
    ],
  },
  {
    id: 'jantar-classicos',
    title: 'Clássicos à mesa',
    occasion: 'Jantares',
    description: 'Melodias conhecidas para um jantar de clima tranquilo.',
    titles: [
      'How Deep Is Your Love',
      'Close to You',
      'Always on My Mind',
      'Heaven',
      'La Vie en Rose',
      'My Way',
      'Over the Rainbow',
      "Isn't She Lovely",
    ],
  },
  {
    id: 'pop-acustico',
    title: 'Pop para um encontro',
    occasion: 'Restaurantes',
    description: 'Pop contemporâneo em uma sequência para encontros e ambientes intimistas.',
    titles: [
      '93 Million Miles',
      'Let Her Go',
      'Photograph',
      'Someone You Loved',
      'Before You Go',
      'Ordinary',
      'Beanie',
      'Birds of a Feather',
    ],
  },
  {
    id: 'evento-movimento',
    title: 'Mais movimento',
    occasion: 'Eventos',
    description: 'Um repertório de canções marcantes para levantar a energia do encontro.',
    titles: [
      'Viva la Vida',
      'A Sky Full of Stars',
      'Sugar',
      'Save Your Tears',
      'Beautiful Things',
      'Anunciação',
      'É Preciso Saber Viver',
      'Tempo Perdido',
    ],
  },
  {
    id: 'louvor-adoracao',
    title: 'Louvor e adoração',
    occasion: 'Celebrações de fé',
    description: 'Canções de adoração organizadas para preparar uma celebração.',
    titles: [
      'A Ele a Glória',
      'Ele É Exaltado',
      'Grande É o Senhor',
      'Bondade de Deus',
      'Oceanos',
      'Deus de Promessas',
      'A Casa É Sua',
      'Tu És + Águas Purificadoras',
    ],
  },
  {
    id: 'casamento-fe',
    title: 'Amor e fé',
    occasion: 'Casamentos religiosos',
    description: 'Uma seleção para cerimônias que unem compromisso, esperança e fé.',
    titles: [
      'Escolhi Te Esperar',
      'Quando Deus Criou Você',
      'Seremos Um',
      'Jesus, Meu Esposo',
      'A Bênção',
      'Oceanos',
      'Tantos Mares',
      'Bondade de Deus',
    ],
  },
  {
    id: 'temas-emocionar',
    title: 'Temas para emocionar',
    occasion: 'Momentos especiais',
    description: 'Temas instrumentais e canções expressivas para momentos de destaque.',
    titles: [
      'O Cisne (Le Cygne)',
      'Cinema Paradiso - Love Theme',
      'Interstellar - Day One',
      'Over the Rainbow',
      'My Way',
      'Hallelujah',
      'In This Shirt',
      'La Vie en Rose',
    ],
  },
  {
    id: 'pop-rock',
    title: 'Pop e rock no violino',
    occasion: 'Apresentações',
    description: 'Baladas e clássicos do pop e do rock para uma apresentação com personalidade.',
    titles: [
      "I Don't Want to Miss a Thing",
      'Heaven',
      'Hotel California',
      "Sweet Child O' Mine",
      'The Scientist',
      'Fix You',
      'Somewhere Only We Know',
      'Another Love',
    ],
  },
  {
    id: 'mpb-fim-tarde',
    title: 'Brasil ao fim da tarde',
    occasion: 'MPB e encontros ao ar livre',
    description: 'Uma sequência brasileira para tocar em encontros descontraídos.',
    titles: [
      'La Belle de Jour',
      'Aquarela',
      'O Caderno',
      'Céu de Santo Amaro',
      'Anunciação',
      'Vilarejo',
      'Trevo (Tu)',
      'Tempo Perdido',
      'Velha Infância',
    ],
  },
] as const

// Resolve only from the authenticated collection; never manufacture assets or media URLs.
export function resolveViolinSetlists<T extends { title: string; instrument: string }>(songs: T[]) {
  const available = new Map(
    songs
      .filter((song) => song.instrument === 'violin')
      .map((song) => [normalizeSearch(song.title), song]),
  )
  return violinSetlists
    .map((setlist) => ({
      ...setlist,
      songs: setlist.titles.flatMap((title) => {
        const song = available.get(normalizeSearch(title))
        return song ? [song] : []
      }),
    }))
    .filter((setlist) => setlist.songs.length > 0)
}
