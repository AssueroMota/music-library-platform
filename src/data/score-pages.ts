import { guidedScores } from '../../shared/guided-scores'
import { publicRepertoire } from '../../shared/public-repertoire'

type ScoreNotes = {
  slug: string
  title: string
  artist: string
  alternateTitle?: string
  introduction: string
  practice: readonly [string, string]
}

const scoreNotes: readonly ScoreNotes[] = [
  {
    slug: 'a-thousand-years',
    title: 'A Thousand Years',
    artist: 'Christina Perri',
    introduction:
      'Para tocar na entrada de uma cerimônia, combine o ponto de início da base e escolha uma frase em que você possa terminar se a entrada for mais curta que a música.',
    practice: [
      'Sinta quatro pulsações por compasso no 12/8 e subdivida cada uma em três. Bata o pulso com a mão e cante o início antes de pegar o violino.',
      'Nas notas sustentadas, planeje quanto arco vai usar desde o ataque. Teste a última nota com o playback para que o volume caia junto com a base.',
    ],
  },
  {
    slug: 'canon-in-d',
    title: 'Canon in D',
    artist: 'Johann Pachelbel',
    alternateTitle: 'Cânone em Ré maior',
    introduction:
      'No Cânone em Ré maior, a base harmônica se repete enquanto o desenho do violino muda. Para uma entrada, use essa repetição para combinar um começo e um encerramento com quem coordena a cerimônia.',
    practice: [
      'Escute o ciclo do baixo antes de tocar e conte quantas pulsações faltam para ele recomeçar. Depois marque um ponto de retomada para o caso de perder a entrada.',
      'Mantenha o mesmo pulso quando passar das notas longas para figuras mais rápidas. Ensaie a transição em dois compassos por vez e depois conecte as frases.',
    ],
  },
  {
    slug: 'careless-whisper',
    title: 'Careless Whisper',
    artist: 'George Michael',
    introduction:
      'Leve para o violino o fraseado da melodia que ficou conhecida pelo saxofone. Na partitura guiada, você pode voltar ao início do tema e comparar onde cada frase começa e termina.',
    practice: [
      'Cante o tema de abertura e identifique onde você naturalmente respiraria. Reproduza essas separações com o arco antes de acrescentar vibrato.',
      'Isole as mudanças de corda do tema e mantenha o movimento da mão direita pequeno. Reintroduza os acentos quando conseguir tocar a sequência sem perder o pulso.',
    ],
  },
  {
    slug: 'every-breath-you-take',
    title: 'Every Breath You Take',
    artist: 'The Police',
    introduction:
      'A pulsação regular do acompanhamento ajuda a localizar as entradas da melodia. A partitura e a versão guiada permitem ensaiar a mesma música em formatos diferentes.',
    practice: [
      'Escute a base e marque o pulso durante a introdução. Toque só a primeira entrada até conseguir repeti-la no mesmo ponto em três tentativas.',
      'Treine o fim de cada frase com a base ainda tocando. Ao retomar, deixe as notas curtas leves para que a linha do violino conserve o contorno da melodia cantada.',
    ],
  },
  {
    slug: 'perfect-ed-sheeran',
    title: 'Perfect',
    artist: 'Ed Sheeran',
    introduction:
      'Na balada de Ed Sheeran, a pulsação e a diferença de intensidade entre verso e refrão ajudam a organizar a interpretação para uma cerimônia ou recepção.',
    practice: [
      'Conte as subdivisões em grupos de três e pratique a passagem do verso ao refrão com a mesma pulsação.',
      'Reserve mais arco para as notas longas do refrão. Grave uma passagem com a base e ouça se a melodia cresce sem acelerar.',
    ],
  },
  {
    slug: 'cant-help-falling-in-love',
    title: "Can't Help Falling in Love",
    artist: 'Elvis Presley',
    introduction:
      'A melodia cantada por Elvis Presley funciona em um repertório de cerimônia. No violino, experimente dar a cada frase tempo para chegar à última nota e deixar a base conduzir até a próxima entrada.',
    practice: [
      'Isole os saltos da melodia e confira a afinação da nota de chegada sem vibrato. Depois volte a ligá-la à nota anterior.',
      'Nas frases longas, planeje as trocas de arco em notas mais leves e escute se a linha continua cantável quando você toca com a base.',
    ],
  },
  {
    slug: 'anunciacao',
    title: 'Anunciação',
    artist: 'Alceu Valença',
    introduction:
      'Para levar Anunciação a um repertório de recepção, preserve a energia rítmica enquanto a melodia passa da voz para o violino.',
    practice: [
      'Bata o pulso com o pé e fale o ritmo do refrão antes de tocar. Repare nas notas que entram entre as pulsações e sustente o pulso nos espaços.',
      'Compare duas articulações no refrão. Um arco curto destaca o ritmo e um arco mais ligado aproxima o fraseado da voz. Use a base para escolher a que funciona na apresentação.',
    ],
  },
  {
    slug: 'eu-sei-que-vou-te-amar',
    title: 'Eu Sei Que Vou Te Amar',
    artist: 'Tom Jobim e Vinicius de Moraes',
    introduction:
      'A canção de Tom Jobim e Vinicius de Moraes cabe em uma apresentação intimista. Acompanhe a melodia cantada para decidir onde respirar e como conduzir cada frase no violino.',
    practice: [
      'Cante uma frase de cada vez e marque suas respirações na partitura. Em seguida toque em dinâmica baixa, mantendo os ataques claros.',
      'Ensaie a liberdade de tempo com e sem playback. Com a base, preste atenção no próximo ponto de encontro para que uma pausa expressiva caiba no acompanhamento.',
    ],
  },
  {
    slug: 'borbulhas-de-amor',
    title: 'Borbulhas de Amor',
    artist: 'Fagner',
    introduction:
      'Na canção do repertório de Fagner, o contraste entre a voz mais contida do verso e a abertura do refrão dá ao violinista um caminho para construir a dinâmica.',
    practice: [
      'Toque o verso com ataques suaves e ouça se as notas de passagem continuam audíveis. No refrão, aumente a velocidade do arco aos poucos.',
      'Repita a passagem do verso para o refrão com a base. Comece uma frase antes da transição para treinar o crescimento inteiro em uma só tomada.',
    ],
  },
  {
    slug: 'autumn-leaves',
    title: 'Autumn Leaves',
    artist: 'Joseph Kosma',
    introduction:
      'O tema de Autumn Leaves se apoia em motivos curtos que mudam de altura ao longo da harmonia. Use a partitura para localizar essas repetições e a versão guiada para acompanhar as entradas.',
    practice: [
      'Isole o primeiro motivo e compare o desenho da mão esquerda quando ele reaparece em outra altura. Escute a afinação das notas de chegada com a base.',
      'Conte o acompanhamento durante as pausas da melodia. Repita o trecho até que a volta do violino coincida com a pulsação sem precisar reiniciar a faixa.',
    ],
  },
  {
    slug: 'ninguem-explica-deus',
    title: 'Ninguém Explica Deus',
    artist: 'Gabriela Rocha',
    introduction:
      'Se você vai tocar este louvor com voz, use a versão de referência para combinar o tom e decidir quais trechos o violino assume sozinho.',
    practice: [
      'Grave o refrão com o playback e verifique se o começo de cada frase cai junto com a base, especialmente depois das respirações.',
      'Pratique duas dinâmicas para o mesmo trecho. Use a mais suave quando houver canto e reserve intensidade para os momentos em que o violino conduzir a melodia.',
    ],
  },
  {
    slug: 'here-comes-the-sun',
    title: 'Here Comes the Sun',
    artist: 'The Beatles',
    introduction:
      'A versão guiada ajuda a acompanhar as entradas de Here Comes the Sun, sobretudo na passagem da seção cantada para a ponte, em que o desenho rítmico muda.',
    practice: [
      'Antes de tocar a ponte, escute a versão guiada e bata a pulsação. Se necessário, volte ao início da passagem para identificar as entradas com a voz ou o acompanhamento.',
      'Ensaie os acentos da mudança de seção com arcos curtos. Depois toque desde a frase anterior para praticar a transição em contexto.',
    ],
  },
]

export type ScorePage = ScoreNotes & {
  style: string
  hasScore: boolean
  hasPlayback: boolean
  hasGuide: boolean
}

export const scorePages: readonly ScorePage[] = scoreNotes.map((notes) => {
  const matches = ([title, artist]: readonly [string, string, ...unknown[]]) =>
    title === notes.title && (!artist || artist === notes.artist)
  const score = publicRepertoire.find(matches)
  const guide = guidedScores.find(matches)
  const style = score?.[2] ?? guide?.[2]
  if (!style) throw new Error(`Missing public catalog metadata for ${notes.slug}`)

  return {
    ...notes,
    style,
    hasScore: Boolean(score),
    hasPlayback: Boolean(score?.[3]),
    hasGuide: Boolean(guide),
  }
})
