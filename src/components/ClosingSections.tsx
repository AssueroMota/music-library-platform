import { ChevronDown } from 'lucide-react'
import { salesFaqs as faqs } from '../data/sales'
import { Container, Logo, SectionHeading } from './ui'

export function FAQSection() {
  return (
    <section id="perguntas" className="faq-section section-space">
      <Container className="faq-grid">
        <SectionHeading
          eyebrow="ANTES DE ESCOLHER"
          center
          title={
            <>
              DÚVIDAS <em>RÁPIDAS.</em>
            </>
          }
        />
        <div className="faq-list">
          {faqs.map(([question, answer]) => (
            <details className="faq-item" key={question}>
              <summary>
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

export function Footer({ onInfo }: { onInfo: (title: string, text: string) => void }) {
  return (
    <footer className="footer">
      <Container>
        <div className="footer-compact">
          <Logo light />
          <nav aria-label="Informações">
            <a href="#planos">Planos</a>
            <a href="#perguntas">Dúvidas</a>
            <button
              onClick={() => onInfo('Contato', 'O canal de suporte será divulgado no lançamento.')}
            >
              Contato
            </button>
            <button
              onClick={() =>
                onInfo(
                  'Termos de uso',
                  'As vendas ainda não estão abertas. Os termos de acesso e de uso dos materiais serão publicados antes do lançamento.',
                )
              }
            >
              Termos de uso
            </button>
            <button
              onClick={() =>
                onInfo(
                  'Privacidade',
                  'O pagamento é realizado no Mercado Pago. Quando confirmado, o e-mail informado na compra é usado para criar ou localizar seu acesso e enviar orientações. Os favoritos da prévia ficam apenas na memória da página. A política completa será publicada antes da abertura das vendas.',
                )
              }
            >
              Privacidade
            </button>
          </nav>
        </div>
        <p className="footer-copyright">
          © {new Date().getFullYear()} Music Library. Todos os direitos reservados.
        </p>
      </Container>
    </footer>
  )
}
