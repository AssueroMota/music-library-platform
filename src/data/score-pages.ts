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
  {
    slug: 'hallelujah-leonard-cohen',
    title: 'Hallelujah',
    artist: 'Leonard Cohen',
    alternateTitle: 'Aleluia',
    introduction:
      'Em Hallelujah, de Leonard Cohen, as notas sustentadas dão espaço para criar dinâmica. A melodia funciona em cerimônias e recepções quando você deixa o acompanhamento respirar entre as frases.',
    practice: [
      'Toque a última nota de cada frase com o metrônomo e planeje quanto arco vai usar até o fim. Mantenha o som presente enquanto a nota diminui de intensidade.',
      'Compare o verso e o refrão com a base. Use a velocidade do arco para fazer o refrão crescer e repita a volta ao verso sem deixar o andamento cair.',
    ],
  },
  {
    slug: 'viva-la-vida',
    title: 'Viva la Vida',
    artist: 'Coldplay',
    introduction:
      'As cordas da gravação de Viva la Vida dão à música um pulso reconhecível. Use a base para manter essa energia quando a melodia passar para o violino.',
    practice: [
      'Marque o pulso da introdução com o pé e cante a primeira entrada da melodia. Confira se você entra no mesmo ponto em duas repetições seguidas.',
      'Em notas repetidas, experimente arcos curtos e concentre o peso nos acentos da frase. Leve essa articulação para o refrão antes de tocar a música inteira.',
    ],
  },
  {
    slug: 'interstellar-day-one',
    title: 'Interstellar - Day One',
    artist: 'Hans Zimmer',
    alternateTitle: 'Tema de Interestelar',
    introduction:
      'Day One vem da trilha de Interestelar. A repetição do acompanhamento dá espaço para fazer a linha do violino crescer aos poucos, como acontece no clima da trilha.',
    practice: [
      'Ouça um ciclo inteiro da base e identifique quando o desenho se repete. Ensaie a entrada a partir desse ponto até conseguir localizá-la sem voltar ao início.',
      'Comece com pouco peso de arco e aumente a velocidade nas frases mais intensas. Grave uma passagem para conferir se o crescimento soa gradual.',
    ],
  },
  {
    slug: 'la-vie-en-rose',
    title: 'La Vie en Rose',
    artist: 'Édith Piaf',
    introduction:
      'O fraseado da voz de Édith Piaf é um ponto de partida para tocar La Vie en Rose em um jantar ou recepção. Ouça como a melodia repousa antes de escolher onde ligar ou separar as notas.',
    practice: [
      'Cante uma frase e marque onde respiraria. Toque a mesma passagem com uma troca de arco discreta nesse ponto.',
      'Teste uma leve demora na nota de chegada e volte no pulso da base. Se a próxima entrada ficar apertada, reduza a demora até a linha soar natural.',
    ],
  },
  {
    slug: 'thinking-out-loud',
    title: 'Thinking Out Loud',
    artist: 'Ed Sheeran',
    introduction:
      'Thinking Out Loud tem um balanço que funciona na primeira dança ou na recepção. Antes de tocar do início ao fim, combine com quem organiza o evento quanto tempo a música precisa durar.',
    practice: [
      'Pratique o início do verso com arcos leves e sem cobrir a pulsação da base. Depois comece diretamente no refrão para conferir a entrada.',
      'Escolha uma frase de encerramento e pratique os compassos que levam até ela. Se for tocar para uma dança, confira o tempo dessa versão com o playback.',
    ],
  },
  {
    slug: 'photograph-ed-sheeran',
    title: 'Photograph',
    artist: 'Ed Sheeran',
    introduction:
      'Em Photograph, de Ed Sheeran, o verso mais contido prepara um refrão que pede mais projeção. O contraste funciona bem em um set de baladas para recepção.',
    practice: [
      'Toque o verso perto do meio do arco e guarde espaço para os sons sustentados. Passe ao refrão com um arco mais amplo sem mudar o andamento.',
      'Mantenha a base tocando nas pausas entre frases. Grave duas passagens e compare se as retomadas coincidem com o pulso.',
    ],
  },
  {
    slug: 'hotel-california',
    title: 'Hotel California',
    artist: 'Eagles',
    introduction:
      'A introdução instrumental de Hotel California prepara a entrada da melodia. Para manter o caráter reconhecível da canção no violino, dê atenção ao pulso da base e aos espaços do verso.',
    practice: [
      'Ouça a introdução e marque na partitura o momento da sua entrada. Comece o exercício alguns segundos antes para treinar a contagem com a base.',
      'Trabalhe separadamente as notas curtas do verso e as mais sustentadas do refrão. Ao juntar as duas partes, mantenha a mesma pulsação.',
    ],
  },
  {
    slug: 'bondade-de-deus',
    title: 'Bondade de Deus',
    artist: '',
    introduction:
      'Bondade de Deus cabe em repertórios de louvor com violino, voz ou banda. Combine a entrada do instrumento e o tom antes do ensaio, principalmente se todos estiverem usando versões diferentes.',
    practice: [
      'Pratique o refrão primeiro com a partitura e depois com o vídeo guiado. Marque em que momento o violino retoma depois de cada respiração.',
      'Ensaie uma passagem com dinâmica mais baixa para acompanhar o canto. Na passagem em que você assume a melodia, aumente a projeção sem antecipar a entrada.',
    ],
  },
  {
    slug: 'oceanos',
    title: 'Oceanos',
    artist: 'Ana Nóbrega',
    alternateTitle: 'Oceans',
    introduction:
      'Oceanos, na versão de Ana Nóbrega, começa com espaço para frases leves e permite um crescimento gradual. Use esse contraste para tocar em uma celebração sem cobrir as vozes.',
    practice: [
      'Ensaie o início com ataques suaves e conte a base nas pausas. Deixe o arco preparado perto da corda para entrar no momento certo.',
      'Experimente tocar a parte mais intensa com arcos longos. Confira com a base se a pulsação segue regular quando você aumenta o volume.',
    ],
  },
  {
    slug: 'a-bencao',
    title: 'A Bênção',
    artist: '',
    introduction:
      'A Bênção pode encerrar um momento de louvor ou uma cerimônia. Se a apresentação tiver canto, defina antes em quais frases o violino dobra a voz e em quais fica em silêncio.',
    practice: [
      'Toque a primeira passagem com o playback e marque o fim de cada frase. Volte do meio da música para praticar uma entrada sem depender da introdução.',
      'Nos trechos repetidos, escolha uma repetição para tocar mais suave. Quando a dinâmica crescer, aumente a velocidade do arco sem apertar a mão direita.',
    ],
  },
  {
    slug: 'aquarela-toquinho',
    title: 'Aquarela',
    artist: 'Toquinho',
    introduction:
      'A melodia de Aquarela funciona em eventos de família e apresentações de MPB. O fraseado cantado ajuda a decidir onde o violino deve respirar e onde a linha precisa continuar.',
    practice: [
      'Separe a melodia em frases curtas e cante cada uma antes de tocar. Ensaie a troca de arco em uma nota leve, longe da nota de chegada.',
      'Depois de tocar cada trecho sozinho, use o playback para juntar as frases. Continue contando o pulso quando a melodia parar por um instante.',
    ],
  },
  {
    slug: 'tocando-em-frente',
    title: 'Tocando em Frente',
    artist: 'Almir Sater',
    introduction:
      'Tocando em Frente funciona em repertórios de MPB, recepções e apresentações intimistas. Deixe as frases assentarem no pulso da base para preservar o caráter tranquilo da canção.',
    practice: [
      'Cante a melodia sobre o playback e observe onde as frases começam em relação ao pulso. Em seguida reproduza os mesmos ataques no violino.',
      'Pratique o fim do refrão em dinâmica baixa e espere a base completar o trecho antes de recomeçar. Faça a última nota perder intensidade gradualmente.',
    ],
  },
  {
    slug: 'garota-de-ipanema',
    title: 'Garota de Ipanema',
    artist: 'Tom Jobim',
    alternateTitle: 'The Girl from Ipanema',
    introduction:
      'Garota de Ipanema funciona em recepções e repertórios de bossa nova. O vídeo guiado ajuda a perceber como as entradas da melodia se encaixam no balanço do acompanhamento.',
    practice: [
      'Antes de tocar, marque uma pulsação regular e fale o ritmo da frase que entra entre as batidas. Repita em andamento lento até o deslocamento ficar natural.',
      'No trecho central, toque a melodia em dinâmica moderada e escute a mudança de harmonia. Volte à abertura sem perder o pulso da bossa nova.',
    ],
  },
  {
    slug: 'stand-by-me',
    title: 'Stand by Me',
    artist: 'Ben E. King',
    introduction:
      'Em Stand by Me, a linha de baixo recorrente ajuda a localizar as entradas da melodia no violino. Use a repetição que você ouve no vídeo guiado para criar pontos de referência.',
    practice: [
      'Acompanhe duas voltas do baixo contando o pulso e entre só na terceira. Se perder a referência, encontre o começo da próxima volta.',
      'Trabalhe os finais de frase longe do início da música. Pause o vídeo em um desses trechos e depois retome para conferir onde a melodia volta.',
    ],
  },
  {
    slug: 'let-it-be',
    title: 'Let It Be',
    artist: 'The Beatles',
    introduction:
      'Let It Be tem uma melodia que alterna trechos leves e resoluções mais marcadas no refrão. Na versão guiada, observe onde a linha do violino ganha espaço depois do verso.',
    practice: [
      'Toque o fim do verso e a primeira frase do refrão como um único exercício. Reserve parte do arco para as notas que precisam continuar soando.',
      'Reveja a entrada do refrão no vídeo. Faça um crescendo curto ao se aproximar da nota de chegada e mantenha o pulso durante o crescimento.',
    ],
  },
  {
    slug: 'yesterday-the-beatles',
    title: 'Yesterday',
    artist: 'The Beatles',
    introduction:
      'Em Yesterday, o comprimento das frases pede escuta além da contagem. No vídeo guiado, compare o tempo que a melodia leva para repousar na abertura e na seção intermediária.',
    practice: [
      'Cante a primeira frase inteira e marque apenas a respiração no fim. No violino, teste duas distribuições de arco para preservar essa linha.',
      'Comece na seção intermediária e volte à melodia principal sem reiniciar o vídeo. Use a nota de chegada como referência e confira se o pulso continua firme.',
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
