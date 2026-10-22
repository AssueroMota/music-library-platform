import type { Instrument, Plan, Track } from '../types'

export const instruments: Instrument[] = [
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
    id: 'instrument',
    name: 'Seu instrumento',
    description: 'Um universo de possibilidades para o instrumento que acompanha você.',
    accessMode: 'Biblioteca por instrumento',
    benefits: [
      'Pastas dedicadas ao seu instrumento',
      'Partituras e acompanhamentos',
      'Organização por estilo e tonalidade',
    ],
  },
  {
    id: 'repertoire',
    name: 'Seu repertório',
    description: 'Uma seleção com propósito, pensada para a sua próxima ocasião.',
    accessMode: 'Pacote de repertório',
    benefits: [
      'Seleções por tipo de evento',
      'Partituras e áudios em pastas organizadas',
      'Repertório para estudar e apresentar',
    ],
  },
  {
    id: 'complete',
    name: 'Todas as possibilidades',
    description: 'Mais instrumentos, mais repertórios e liberdade para explorar.',
    accessMode: 'Acesso completo',
    featured: true,
    benefits: [
      'Bibliotecas de todos os instrumentos',
      'Repertórios para diferentes ocasiões',
      'Partituras e backing tracks integrados',
    ],
  },
]

export const faqs = [
  [
    'Como as partituras são organizadas?',
    'A proposta segue uma organização familiar de pastas e arquivos, próxima à lógica de um gerenciador como o Google Drive. Na prévia, abra a pasta do instrumento e depois as subpastas de partituras ou backing tracks. Você pode buscar, ordenar, alternar lista e grade, marcar favoritos e abrir a prévia de um arquivo. Upload, movimentação de arquivos e armazenamento em nuvem ainda não estão disponíveis.',
  ],
  [
    'Quais instrumentos são atendidos?',
    'A proposta contempla violino, saxofone alto e tenor, flauta transversal, violão, viola de arco e violoncelo. Nesta primeira versão, você pode explorar exemplos locais para os seis instrumentos. O catálogo comercial ainda está em preparação.',
  ],
  [
    'Como funciona o acesso à biblioteca?',
    'Esta página apresenta uma demonstração pública. O acesso à biblioteca privada será disponibilizado em uma próxima fase, após a implantação de cadastro, autenticação e pagamento. Ainda não há venda ou acesso contratado.',
  ],
  [
    'Posso acessar pelo tablet?',
    'Sim, esta demonstração se adapta a computadores, tablets e celulares. O acesso aos materiais da futura biblioteca seguirá a mesma proposta de navegação responsiva.',
  ],
  [
    'Os materiais incluem backing tracks?',
    'A proposta é associar partituras a backing tracks. Aqui você pode ouvir duas composições originais com acompanhamento e melodia sintetizados. Os áudios demonstrativos não representam gravações reais dos instrumentos ou a qualidade final do catálogo.',
  ],
  [
    'Posso visualizar partituras pela plataforma?',
    'Na prévia, abra uma pasta, entre em Partituras e selecione um arquivo para ver o estudo ilustrativo no painel de visualização. O visualizador de PDFs completos e os arquivos para download serão integrados futuramente.',
  ],
  [
    'Como receberei o acesso depois da compra?',
    'Quando as integrações estiverem prontas, o processo planejado será: confirmação do pagamento, liberação automática e envio de orientações por e-mail. Nesta etapa não há checkout nem envio de e-mails.',
  ],
  [
    'Existem repertórios para casamentos?',
    'Casamentos estão entre as categorias planejadas, junto a restaurantes, igrejas e eventos corporativos. Os cartões desta página apresentam a proposta editorial, não pacotes já disponíveis para compra.',
  ],
  [
    'Como funciona a compra de novos pacotes?',
    'Os modelos planejados são biblioteca por instrumento, pacote de repertório e acesso completo. Preços, duração do acesso e regras comerciais serão publicados antes da abertura das vendas.',
  ],
]

export const navigation = [
  ['Início', '#inicio'],
  ['Instrumentos', '#instrumentos'],
  ['Como funciona', '#como-funciona'],
  ['Biblioteca', '#biblioteca'],
  ['Planos', '#planos'],
  ['FAQ', '#perguntas'],
]
