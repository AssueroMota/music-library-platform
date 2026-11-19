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
              Tudo pronto para <em>escolher?</em>
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

export function Footer({
  onInfo,
  onContact,
  renderedAt,
}: {
  onInfo: (title: string, text: string) => void
  onContact: () => void
  renderedAt?: number
}) {
  const year = new Intl.DateTimeFormat('pt-BR', {
    year: 'numeric',
    timeZone: 'America/Sao_Paulo',
  }).format(renderedAt)
  return (
    <footer className="footer">
      <Container>
        <div className="footer-compact">
          <Logo light />
          <nav aria-label="Informações">
            <a href="/biblioteca">Já sou cliente</a>
            <a href="#planos">Planos</a>
            <a href="#perguntas">Dúvidas</a>
            <button onClick={onContact}>Contato</button>
            <button
              onClick={() =>
                onInfo(
                  'Termos de uso',
                  'Os planos pagos estão disponíveis para compra com pagamento único, sem mensalidade. ' +
                    'Confira os materiais incluídos no seu plano e o valor final no checkout. ' +
                    'O Mercado Pago processa o pagamento. Após a confirmação, enviamos o link de acesso à biblioteca para o e-mail informado no checkout.',
                )
              }
            >
              Termos de uso
            </button>
            <button
              onClick={() =>
                onInfo(
                  'Privacidade',
                  'Usamos o e-mail informado no teste grátis ou no checkout para criar ou localizar seu acesso à biblioteca e enviar o link e as orientações. ' +
                    'Nas compras, também enviamos o e-mail ao Mercado Pago para processar o pedido. Enviamos o link de acesso após a confirmação do pagamento.',
                )
              }
            >
              Privacidade
            </button>
          </nav>
        </div>
        <p className="footer-copyright">
          © {year} Music Library. Todos os direitos reservados.
        </p>
      </Container>
    </footer>
  )
}
