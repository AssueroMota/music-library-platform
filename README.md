# Music Library Platform

Landing page de partituras e backing tracks com checkout Mercado Pago, acesso por e-mail e biblioteca privada. Mantém React, Vite, TypeScript, Tailwind e a identidade visual original. A API usa Fastify, SDK oficial do Mercado Pago, Prisma/PostgreSQL, Supabase Auth, Resend e Zod.

## Executar

Node.js 22.12+ e npm. A integração real precisa de PostgreSQL e dos provedores descritos em [docs/checkout.md](docs/checkout.md).

```sh
npm ci
npm run db:generate
```

Copie `.env.example` para `.env` e preencha as configurações. Segredos ficam exclusivamente no backend; somente variáveis `VITE_*` são públicas.

```sh
npm run db:migrate
npm run db:seed
npm run dev:server
```

Em outro terminal:

```sh
npm run dev
```

O Vite encaminha `/api` para `http://127.0.0.1:3001`. A landing page pode ser executada sozinha; sem API, o checkout informa indisponibilidade e não simula compras. `CHECKOUT_ENABLED=false` é o padrão até finalizar a configuração.

## Compra e entrega

1. O visitante escolhe a coleção de 100 partituras para violino, sem ou com playbacks, consultando preço e disponibilidade atuais. Os dois planos incluem 10 setlists e acesso vitalício; a coleção está em expansão.
2. O navegador envia `productId`, e-mail de entrega e `expectedPriceCents` no corpo de `POST /api/checkout`. Cabeçalhos identificam a tentativa e protegem a consulta de status.
3. O servidor lê o produto no PostgreSQL, aplica a regra compartilhada de lançamento, verifica o total esperado, grava o pedido e cria uma order pelo SDK oficial, retornando `checkout_url`.
4. O comprador informa dados e paga no ambiente do Mercado Pago.
5. Uma notificação assinada é persistida. A fila consulta a order no provedor, verifica conta, valor, moeda, referência e produto, e confirma o estado.
6. Após aprovação real, a fila cria/localiza o usuário Supabase, grava o acesso e envia o link pelo Resend. Erros de e-mail não removem o acesso concedido.
7. O usuário acessa `/biblioteca`; downloads exigem sessão válida e acesso ativo.

As páginas `/checkout/success`, `/checkout/pending` e `/checkout/failure` consultam o backend. A URL do retorno nunca autoriza uma compra. Estorno total, parcial e contestação suspendem o acesso referente ao pedido.

## Catálogo e arquivos

`shared/products.ts` define os dois produtos atuais para violino: coleção de 100 partituras sem playback por R$ 12,90 e com playbacks por R$ 27,90 no lançamento. Ambos incluem 10 setlists e acesso vitalício. O site informa que o acervo está em expansão; a biblioteca conta somente os arquivos efetivamente publicados. `shared/violin-launch.ts` define o prazo fixo até 27/10/2026 às 23h59 (Brasília) e o preço de R$ 49,90 do Completo a partir de 28/10/2026. O backend aplica a mesma regra no catálogo público e na criação da cobrança. O resumo consulta a API antes de pagar e pede uma nova confirmação se o valor mudar. Os produtos antigos permanecem no banco para preservar compras e acessos anteriores; a migração retira suas ofertas de venda. Consulte [docs/violin-offer.md](docs/violin-offer.md).

Os estudos em `public/` são demonstrações; consulte [docs/assets.md](docs/assets.md). Os materiais comerciais precisam ser importados em bucket privado antes do lançamento, com `npm run library:import -- caminho/do/manifesto.json`.

## Estrutura

```text
src/components/          Landing page, checkout, retornos e biblioteca privada
src/lib/                 Cliente da API e Supabase público
src/test/                Interações do frontend em JSDOM
shared/products.ts       Catálogo inicial compartilhado
server/app.ts            Rotas, autenticação, validação e controles HTTP
server/service.ts        Pedidos, validação de pagamento, acesso e fila
server/providers.ts      SDKs Mercado Pago, Supabase e Resend
server/security.ts       Assinaturas, tokens e criptografia do outbox
server/email.ts          Template de confirmação em HTML e texto
server/checkout.test.ts  Integração com PostgreSQL temporário real
prisma/                  Esquema, migrações e seed
docs/checkout.md         Configuração dos provedores e operação
```

## Verificação e produção

```sh
npm test                 # Frontend + backend; inicia PostgreSQL isolado temporário
npm run typecheck
npm run lint
npm run build            # Frontend em dist/ e API em dist-server/
npm start                # Aplica migrações pendentes e inicia API compilada e fila
npm run preview          # Preview estático; configure VITE_API_URL para API em outra origem
```

Os testes substituem os serviços externos por doubles controlados. Não acessam contas reais nem comprovam compra no sandbox oficial. Essa validação requer credenciais e segue o roteiro de [docs/checkout.md](docs/checkout.md).

A API precisa de um processo Node persistente para executar a fila. Sirva `dist/` por HTTPS com fallback para `index.html` nas rotas do frontend e proxy de `/api` para a API. Não exponha a pasta do repositório ou `.env`. Configure `VITE_PUBLIC_SITE_URL` para canonical/Open Graph.

No Render, use `npm start` como comando de início para executar também o `prestart` com `prisma migrate deploy`. A migração `202610240005_violin_offers` cria os planos atuais com os preços e permissões correspondentes. Se o serviço usar diretamente `node dist-server/server/index.js`, configure `npm run db:migrate` como comando de pré-deploy. Publique frontend e API da mesma revisão. O envio ao GitHub não confirma por si só que ambos os serviços concluíram o deploy.

Para publicar o frontend na Vercel, use o `vercel.json` e siga [docs/vercel.md](docs/vercel.md). A configuração do frontend não publica automaticamente a API ou o processamento da fila.
