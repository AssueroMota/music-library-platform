// Configure the presentation video and authorized customer accounts here.
export interface ViolinTestimonial {
  name: string
  context: string
  quote: string
  photo: string
  photoAlt: string
}
export const violinPresentation: { videoSrc: string | null; poster: string } = {
  videoSrc: '/videos/music-library-apresentacao.mp4',
  poster: '/videos/music-library-apresentacao.jpg',
}
export const violinTestimonials: ViolinTestimonial[] = []

export interface ViolinCreator {
  name: string
  role: string
  biography: string
  photo: string | null
  photoAlt: string
}

// Publish only the actual creator's supplied credentials and portrait.
export const violinCreator: ViolinCreator | null = {
  name: 'Quem vive a música entende a preparação.',
  role: '25 anos de experiência musical',
  biography:
    'A proposta da Music Library nasce de uma trajetória de 25 anos com a música. Essa vivência está por trás da ideia de reunir partituras para violino e a opção com playbacks em uma biblioteca para apoiar a sua preparação. Conheça a demonstração e veja a organização por dentro.',
  photo: null,
  photoAlt: '',
}

export interface ViolinLaunchCampaign {
  title: string
  benefit: string
  startsAt: string
  endsAt: string
}

// ISO dates must include a timezone, e.g. 2026-11-01T23:59:59-03:00.
// Set only when the benefit is actually available for the entire declared period.
export const violinLaunchCampaign: ViolinLaunchCampaign | null = null
export const violinMoments = [
  {
    photo: '/images/violin-event.jpg',
    alt: 'Violinista de traje social tocando em uma celebração decorada com flores',
    label: 'A EMOÇÃO DE UM SIM',
    title: 'Casamentos',
    text: 'Da entrada à celebração: prepare sua interpretação para momentos que merecem uma trilha especial.',
  },
  {
    photo: '/images/violin-dining.jpg',
    alt: 'Violinista de traje social tocando em um restaurante com mesas ao fundo',
    label: 'O CLIMA DE UMA NOITE ESPECIAL',
    title: 'Restaurantes',
    text: 'Leve sua personalidade musical para jantares, recepções e ambientes onde cada detalhe conta.',
  },
  {
    photo: '/images/violin-concert-front.jpg',
    alt: 'Violinista vista pela frente tocando no palco, com estantes de partitura ao redor',
    label: 'A PRESENÇA DE QUEM TOCA',
    title: 'Eventos & apresentações',
    text: 'Do encontro intimista ao palco: estude suas músicas e construa uma apresentação com a sua identidade.',
  },
] as const
