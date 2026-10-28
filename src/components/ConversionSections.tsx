import { useEffect, useState } from 'react'
import { CalendarClock, Check, FileMusic, Headphones, Mail, ShieldCheck } from 'lucide-react'
import { violinCreator, violinLaunchCampaign } from '../data/violin-sales'
import { activeLaunchCampaign } from '../lib/launch-campaign'
import { Button, Container, Reveal, SectionHeading } from './ui'
import { useOfferPricing } from '../lib/use-offer-pricing'
import { formatBRL } from '../../shared/products'

export function CreatorSection() {
  const creator = violinCreator
  if (!creator) return null
  return (
    <section className="creator-section section-space" aria-labelledby="creator-title">
      <Container className="creator-layout">
        {creator.photo ? (
          <img src={creator.photo} alt={creator.photoAlt} width="600" height="700" loading="lazy" />
        ) : (
          <div className="creator-experience">
            <span>UMA TRAJETÓRIA COM A MÚSICA</span>
            <strong>
              25<span>anos</span>
            </strong>
            <div className="experience-staff" aria-hidden="true">
              𝄞 &nbsp; ♪ &nbsp; ♫ &nbsp; ♪
            </div>
            <p>
              Experiência musical
              <br />
              por trás da Music Library.
            </p>
          </div>
        )}
        <div>
          <span className="eyebrow">QUEM ESTÁ POR TRÁS DO MATERIAL</span>
          <h2 id="creator-title">{creator.name}</h2>
          <strong>{creator.role}</strong>
          <p>{creator.biography}</p>
          <Button href="#demonstracao">Conhecer a demonstração</Button>
        </div>
      </Container>
    </section>
  )
}

export function ConfidenceSection() {
  const { prices } = useOfferPricing()
  return (
    <section id="sua-escolha" className="confidence-section section-space">
      <Container>
        <SectionHeading
          center
          eyebrow="ESCOLHA COM CLAREZA"
          title={
            <>
              Você sabe o que recebe.
              <br />
              <em>E como vai usar.</em>
            </>
          }
        >
          Do primeiro clique ao ensaio, cada etapa tem seu lugar. Conheça a experiência antes de
          escolher seu plano.
        </SectionHeading>
        <div className="confidence-grid">
          <Reveal>
            <article>
              <FileMusic size={25} />
              <span>01 · EXPERIMENTE</span>
              <h3>Veja e ouça antes.</h3>
              <p>
                Abra a partitura de A Thousand Years e escute o playback de demonstração. Confira
                como os materiais ficam organizados na biblioteca.
              </p>
              <a href="#demonstracao">
                Explorar a demonstração <span aria-hidden="true">↗</span>
              </a>
            </article>
          </Reveal>
          <Reveal delay={0.07}>
            <article>
              <ShieldCheck size={25} />
              <span>02 · ESCOLHA COM SEGURANÇA</span>
              <h3>O plano é claro.</h3>
              <p>
                {formatBRL(prices[0])} pela coleção de 100 partituras. {formatBRL(prices[1])} com
                playbacks. São 10 setlists no Básico e 42 no Completo, com acesso vitalício. Coleção
                em expansão, com compra única e valor confirmado antes do pagamento.
              </p>
              <a href="#planos">
                Comparar os dois planos <span aria-hidden="true">↗</span>
              </a>
            </article>
          </Reveal>
          <Reveal delay={0.14}>
            <article>
              <Mail size={25} />
              <span>03 · ACESSE SUA BIBLIOTECA</span>
              <h3>Seu acesso por e-mail.</h3>
              <p>
                Após a confirmação do pagamento e a preparação do acesso, você recebe seu link
                pessoal. Abra pelo computador, tablet ou celular.
              </p>
              <a href="#como-funciona">
                Entender como funciona <span aria-hidden="true">↗</span>
              </a>
            </article>
          </Reveal>
        </div>
        <div className="confidence-bottom">
          <span>
            <Check size={16} /> Biblioteca dedicada ao violino
          </span>
          <span>
            <Headphones size={16} /> Playbacks no Plano Completo
          </span>
          <span>
            <Check size={16} /> Sem mensalidade
          </span>
        </div>
      </Container>
    </section>
  )
}

export function LaunchCampaignNote() {
  const [now, setNow] = useState(Date.now)
  useEffect(() => {
    if (!violinLaunchCampaign) return
    const interval = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(interval)
  }, [])
  const campaign = activeLaunchCampaign(violinLaunchCampaign, now)
  if (!campaign) return null
  const deadline = new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(new Date(campaign.endsAt))
  return (
    <aside className="launch-campaign" aria-label="Condição de lançamento">
      <CalendarClock size={26} />
      <div>
        <strong>{campaign.title}</strong>
        <p>{campaign.benefit}</p>
        <span>
          Válida até <time dateTime={campaign.endsAt}>{deadline}</time> (horário de Brasília).
        </span>
      </div>
    </aside>
  )
}
