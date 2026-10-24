# Estado das integrações

O checkout possui API Fastify, PostgreSQL/Prisma, integração Orders API do Mercado Pago, notificações assinadas, fila persistente, Supabase Auth e Resend. A landing page e a prévia pública continuam preservadas.

Veja [checkout.md](checkout.md) para instalação, credenciais, testes oficiais e operação.

Em 24/10/2026, frontend e API estão publicados com domínios HTTPS, banco Supabase persistente e bucket privado. O domínio de envio Resend foi verificado e o e-mail de teste chegou ao Gmail com acentos corretos. O webhook de teste foi cadastrado no Mercado Pago. O pagamento externo e o caminho completo pagamento → e-mail → acesso ainda precisam de validação; as compras permanecem desativadas.

Os estudos em `public/` são demonstrações públicas e não constituem a biblioteca vendida. Arquivos comerciais são importados por `npm run library:import` e entregues por URLs temporárias após autenticação e verificação dos acessos.

Autoria/licenças, suporte oficial, termos, privacidade e condições comerciais devem ser finalizados antes de abrir as vendas. Não foram inventadas garantias, duração de acesso ou condições de reembolso.

A biblioteca privada possui busca por música/artista, filtros de instrumento e estilo, tabela com arquivos agrupados por música, reprodução de áudio e leitura de PDF/PNG na página. “Fix You”, para violino, foi usado para a conferência local do layout com os arquivos fornecidos pelo operador; essa conferência não concede acesso por compra nem substitui o teste de pagamento.

Outras evoluções possíveis: painel administrativo, histórico de compras, métricas/alertas da fila e rate limiting compartilhado para múltiplas instâncias.
