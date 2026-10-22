import { ArrowUpRight, AudioLines, ChevronDown, ImagePlus, Music2 } from 'lucide-react'
import { faqs, navigation } from '../data/content'
import { Button, Container, Logo, SectionHeading } from './ui'

export function AboutSection() {
  return (
    <section className="about-section section-space" id="sobre">
      <Container className="about-grid">
        <div className="founder-visual">
          <div className="founder-frame">
            <ImagePlus size={32} strokeWidth={1} />
            <span>O ROSTO POR TRÁS DA MÚSICA</span>
            <p>
              Espaço reservado
              <br />
              para a foto do fundador.
            </p>
          </div>
          <div className="founder-quote">
            <span>“</span>Música é o que nos move.
            <br />
            <em>Organização é o que nos liberta.</em>
          </div>
          <span className="founder-caption">MUSIC LIBRARY · PROPÓSITO EM CADA NOTA</span>
        </div>
        <div>
          <SectionHeading
            eyebrow="DE MÚSICO PARA MÚSICO"
            title={
              <>
                Criado por quem
                <br />
                <em>vive a música.</em>
              </>
            }
          />
          <p className="about-copy">
            A Music Library nasceu da experiência de um músico que conhece os desafios de encontrar
            bons materiais, organizar repertórios e preparar apresentações.
          </p>
          <p className="about-copy">
            Nossa missão é unir música e tecnologia para tornar a rotina dos instrumentistas mais
            prática, produtiva e inspiradora.
          </p>
          <div className="about-signature">
            <AudioLines size={30} strokeWidth={1.3} />
            <span>
              Mais que arquivos.
              <br />
              <strong>Um lugar para a sua música.</strong>
            </span>
          </div>
        </div>
      </Container>
    </section>
  )
}

export function FAQSection() {
  return (
    <section id="perguntas" className="faq-section section-space">
      <Container className="faq-grid">
        <SectionHeading
          eyebrow="VAMOS AFINAR OS DETALHES"
          title={
            <>
              Boas perguntas.
              <br />
              <em>Respostas claras.</em>
            </>
          }
        >
          Tudo o que você precisa saber sobre esta primeira versão e os próximos passos do projeto.
        </SectionHeading>
        <div className="faq-list">
          {faqs.map(([question, answer], i) => (
            <details className="faq-item" key={question}>
              <summary>
                <span className="faq-number">0{i + 1}</span>
                {question}
                <ChevronDown size={18} />
              </summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
      </Container>
    </section>
  )
}

export function FinalCTA() {
  return (
    <section className="final-section">
      <Container>
        <div className="final-staff" aria-hidden="true">
          <Music2 size={80} strokeWidth={0.5} />
        </div>
        <span className="eyebrow">
          <i />
          SUA HISTÓRIA AINDA TEM MUITAS NOTAS
        </span>
        <h2>
          Seu próximo repertório
          <br />
          <em>começa aqui.</em>
        </h2>
        <p>
          Mais organização, mais possibilidades e mais tempo dedicado
          <br className="desktop-break" /> ao que realmente importa: fazer música.
        </p>
        <Button href="#biblioteca">Conhecer a Music Library</Button>
        <span className="final-note">Explore a demonstração. Imagine as possibilidades.</span>
      </Container>
    </section>
  )
}

export function Footer({ onInfo }: { onInfo: (title: string, text: string) => void }) {
  return (
    <footer className="footer">
      <Container>
        <div className="footer-top">
          <div className="footer-brand">
            <Logo light />
            <p>
              Partituras, repertórios e possibilidades.
              <br />
              De músico para músico.
            </p>
            <span className="footer-project">
              <i /> PROJETO EM DESENVOLVIMENTO
            </span>
          </div>
          <div className="footer-links">
            <span>EXPLORE</span>
            {navigation.slice(0, 4).map(([label, href]) => (
              <a href={href} key={href}>
                {label}
              </a>
            ))}
          </div>
          <div className="footer-links">
            <span>CONHEÇA</span>
            <a href="#sobre">Sobre o projeto</a>
            <a href="#planos">Modalidades de acesso</a>
            <a href="#perguntas">Perguntas frequentes</a>
            <button
              onClick={() =>
                onInfo(
                  'Contato',
                  'O canal oficial de contato será informado no lançamento. Nenhum telefone, e-mail ou perfil social está publicado nesta demonstração. Para acompanhar o desenvolvimento, consulte o repositório oficial do projeto.',
                )
              }
            >
              Contato <ArrowUpRight size={13} />
            </button>
            <a
              className="repository-link"
              href="https://github.com/AssueroMota/music-library-platform"
              target="_blank"
              rel="noopener noreferrer"
            >
              Repositório do projeto <ArrowUpRight size={13} />
            </a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Music Library. Todos os direitos reservados.</p>
          <div>
            <button
              onClick={() =>
                onInfo(
                  'Termos de uso — em preparação',
                  'Esta é uma página pública de apresentação com conteúdo demonstrativo. Ainda não há contratação, venda ou biblioteca privada disponível. Os termos comerciais, as licenças dos materiais e as condições de uso serão publicados antes da abertura das vendas. Esta mensagem não substitui os termos de uso definitivos.',
                )
              }
            >
              Termos de uso
            </button>
            <button
              onClick={() =>
                onInfo(
                  'Privacidade — informações desta versão',
                  'Esta demonstração não inclui formulários, cadastro, cookies de análise ou armazenamento de dados pessoais no aplicativo. Busca, filtros e favoritos existem apenas na memória desta página e são reiniciados ao recarregar. A hospedagem pode processar registros técnicos de acesso. A política de privacidade completa será publicada antes da integração de contas, pagamento ou outros serviços.',
                )
              }
            >
              Política de privacidade
            </button>
          </div>
        </div>
      </Container>
    </footer>
  )
}
