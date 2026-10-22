# Estado das integrações

O checkout possui API Fastify, PostgreSQL/Prisma, integração Orders API do Mercado Pago, notificações assinadas, fila persistente, Supabase Auth e Resend. A landing page e a prévia pública continuam preservadas.

Veja [checkout.md](checkout.md) para instalação, credenciais, testes oficiais e operação.

Dependem de configuração externa: contas e chaves, banco persistente, domínios HTTPS, webhook no painel do Mercado Pago, domínio de e-mail verificado, bucket privado, materiais comerciais e publicação. Nenhuma cobrança externa foi validada nesta máquina sem essas credenciais.

Os estudos em `public/` são demonstrações públicas e não constituem a biblioteca vendida. Arquivos comerciais são importados por `npm run library:import` e entregues por URLs temporárias após autenticação e verificação dos acessos.

Autoria/licenças, suporte oficial, termos, privacidade e condições comerciais devem ser finalizados antes de abrir as vendas. Não foram inventadas garantias, duração de acesso ou condições de reembolso.

Outras evoluções possíveis: painel administrativo, busca avançada da biblioteca privada, histórico de compras, métricas/alertas da fila e rate limiting compartilhado para múltiplas instâncias.
