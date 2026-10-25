import {
  ArrowRight,
  ArrowUpRight,
  Check,
  FileMusic,
  Headphones,
  Play,
  ShieldCheck,
  Quote,
} from 'lucide-react'
import { violinPresentation, violinTestimonials, violinMoments } from '../data/violin-sales'
import { Button, Container, Reveal, SectionHeading } from './ui'
import { useOfferPricing } from '../lib/use-offer-pricing'
import { formatBRL } from '../../shared/products'

export function VideoSection() {
  return (
    <section id="apresentacao" className="video-section section-space">
      <Container className="video-layout">
        <Reveal className="video-copy">
          <SectionHeading
            eyebrow="CONHEÇA ANTES DE ESCOLHER"
            title={
              <>
                A sua música começa
                <br />
                <em>antes do primeiro arco.</em>
              </>
            }
          >
            Você cuida da interpretação. A Music Library reúne suas partituras e, no Plano Completo,
            os acompanhamentos para colocar o ensaio em movimento.
          </SectionHeading>
          <ul className="video-talking-points">
            <li>
              <FileMusic size={19} />
              <span>Encontre a partitura na sua biblioteca.</span>
            </li>
            <li>
              <Headphones size={19} />
              <span>Ensaie com playback no Plano Completo.</span>
            </li>
            <li>
              <Check size={19} />
              <span>Prepare cada detalhe da sua interpretação.</span>
            </li>
          </ul>
          <a className="text-link" href="#planos">
            Quero escolher meu material <ArrowRight size={17} />
          </a>
        </Reveal>
        <Reveal className="video-frame" delay={0.1}>
          {violinPresentation.videoSrc ? (
            <video
              controls
              preload="none"
              poster={violinPresentation.poster}
              aria-label="Apresentação da Music Library para violinistas"
            >
              <source src={violinPresentation.videoSrc} />
              Seu navegador não suporta este vídeo.
            </video>
          ) : (
            <div
              className="video-placeholder"
              role="img"
              aria-label="Espaço reservado para o vídeo de apresentação. Disponível em breve."
            >
              <img src={violinPresentation.poster} alt="" loading="lazy" />
              <div className="video-placeholder-content">
                <span className="video-play-mark" aria-hidden="true">
                  <Play size={31} fill="currentColor" />
                </span>
                <span className="video-status">VÍDEO DE APRESENTAÇÃO · EM BREVE</span>
                <strong>
                  Do primeiro clique
                  <br />
                  ao próximo ensaio.
                </strong>
                <p>Conheça a proposta e veja a biblioteca por dentro.</p>
              </div>
              <div className="video-placeholder-footer">
                <span>MUSIC LIBRARY ORIGINAL</span>
                <span>PARTITURAS + PLAYBACKS</span>
              </div>
            </div>
          )}
        </Reveal>
      </Container>
    </section>
  )
}

export function StoriesSection() {
  return (
    <section id="ocasioes" className="stories-section section-space">
      <Container>
        <div className="stories-heading">
          <SectionHeading
            title={
              <>
                Tem momentos que pedem
                <br />
                <em>mais do que música de fundo.</em>
              </>
            }
          >
            Uma cerimônia emocionante. Um jantar com atmosfera. Uma apresentação com personalidade.
            O próximo repertório começa no seu ensaio.
          </SectionHeading>
        </div>
        <div className="violin-moments">
          {violinMoments.map((moment, index) => (
            <Reveal key={moment.title} delay={index * 0.07}>
              <figure className={`violin-moment moment-${index}`}>
                <img src={moment.photo} alt={moment.alt} width="800" height="1000" loading="lazy" />
                <figcaption>
                  <span>{moment.label}</span>
                  <h3>{moment.title}</h3>
                  <p>{moment.text}</p>
                  <a href="#planos">
                    Quero preparar meu repertório <ArrowUpRight size={16} />
                  </a>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
        <p className="moments-photo-note">
          Imagens de apresentações para ilustrar as ocasiões. Fotos: Luis Morales Torres, Los
          Muertos Crew e cottonbro studio / Pexels.
        </p>
        {violinTestimonials.length > 0 && (
          <div id="historias" className="testimonial-grid">
            {violinTestimonials.map((story) => (
              <figure className="testimonial-card" key={story.name}>
                <img
                  src={story.photo}
                  alt={story.photoAlt}
                  width="480"
                  height="480"
                  loading="lazy"
                />
                <Quote size={22} />
                <blockquote>“{story.quote}”</blockquote>
                <figcaption>
                  <strong>{story.name}</strong>
                  <span>{story.context}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </Container>
    </section>
  )
}

export function PreparationSection() {
  return (
    <section className="preparation-section section-space">
      <Container className="preparation-layout">
        <Reveal className="preparation-copy">
          <span className="eyebrow">SUA ENERGIA MERECE ESTAR NA MÚSICA</span>
          <h2>
            O evento tem data.
            <br />
            <em>Seu preparo começa antes.</em>
          </h2>
          <p>
            Encontrar a partitura em um lugar, procurar uma base em outro e tentar organizar tudo
            perto da apresentação consome o tempo que você poderia dedicar ao violino.
          </p>
          <p>
            <strong>Traga o foco de volta para o ensaio.</strong> Tenha suas partituras organizadas
            e escolha os playbacks para praticar com acompanhamento.
          </p>
          <Button href="#planos">Quero focar na minha música</Button>
        </Reveal>
        <Reveal className="preparation-board" delay={0.1}>
          <span className="board-kicker">UM CAMINHO MAIS SIMPLES PARA ENSAIAR</span>
          <ol>
            <li>
              <span>01</span>
              <div>
                <strong>Escolha sua música</strong>
                <p>Encontre a partitura na biblioteca.</p>
              </div>
              <FileMusic size={23} />
            </li>
            <li>
              <span>02</span>
              <div>
                <strong>Prepare a interpretação</strong>
                <p>Com playback, no Plano Completo.</p>
              </div>
              <Headphones size={23} />
            </li>
            <li>
              <span>03</span>
              <div>
                <strong>Coloque sua identidade</strong>
                <p>A técnica é sua. A expressão também.</p>
              </div>
              <Play size={23} />
            </li>
          </ol>
          <div className="board-end">
            <Check size={17} /> Mais organização para o seu próximo ensaio.
          </div>
        </Reveal>
      </Container>
    </section>
  )
}

export function FinalInvitation() {
  return (
    <section className="final-invitation">
      <Container>
        <span className="eyebrow">SEU PRÓXIMO EVENTO COMEÇA NO ENSAIO DE HOJE</span>
        <h2>
          Quem ouve sente.
          <br />
          <em>Quem se prepara, faz acontecer.</em>
        </h2>
        <p>Escolha seu plano. Prepare sua interpretação. Leve seu violino para a cena.</p>
        <Button href="#planos">Quero meu repertório para violino</Button>
        <span className="final-payment">
          <ShieldCheck size={15} /> Compra única · Pagamento pelo Mercado Pago
        </span>
      </Container>
    </section>
  )
}

export function MobileOfferBar() {
  const { prices, launchActive } = useOfferPricing()
  return (
    <aside className="mobile-offer-bar" aria-label="Atalho para os planos">
      <div>
        <span>
          {launchActive ? 'LANÇAMENTO · PARTITURAS + PLAYBACKS' : 'PARTITURAS + PLAYBACKS'}
        </span>
        <strong>Plano Completo · {formatBRL(prices[1])}</strong>
      </div>
      <a href="#plano-complete">
        Quero o Completo <ArrowUpRight size={17} />
      </a>
    </aside>
  )
}
