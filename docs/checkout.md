# Checkout Mercado Pago — configuração e operação

## Contrato adotado

Usa exclusivamente **Checkout Pro via Orders API**: `POST /v1/orders`, `GET /v1/orders/{id}`, `processing_mode: manual`, `config.online` e `checkout_url`. Não usa Preferences, `init_point`, nem notificações legadas de `payment`/`merchant_order`.

Documentação oficial consultada em 22/10/2026:

- [Criar a order](https://www.mercadopago.com.br/developers/pt/docs/checkout-pro-orders/create-order)
- [Referência da criação](https://www.mercadopago.com.br/developers/pt/reference/online-payments/checkout-pro/create-order/post)
- [URLs de retorno](https://www.mercadopago.com.br/developers/pt/docs/checkout-pro-orders/web-integration/configure-back-urls)
- [Assinatura e notificações](https://www.mercadopago.com.br/developers/pt/docs/checkout-pro-orders/notifications)
- [Estados da order](https://www.mercadopago.com.br/developers/pt/docs/checkout-pro-orders/payment-management/status/order-status)
- [Contestações](https://www.mercadopago.com.br/developers/pt/docs/checkout-pro-orders/chargebacks/notifications)
- [Compra de teste](https://www.mercadopago.com.br/developers/pt/docs/checkout-pro-orders/integration-test/test-purchase-with-card)
- [Supabase generateLink](https://supabase.com/docs/reference/javascript/auth-admin-generatelink)
- [Resend e-mails](https://resend.com/docs/api-reference/emails/send-email)

## Variáveis

Copie `.env.example` para `.env`. Não envie chaves por chat nem as versione.

| Variável                      | Uso                                                                            |
| ----------------------------- | ------------------------------------------------------------------------------ |
| `DATABASE_URL`                | PostgreSQL com conexão adequada para transações e migrações; pode ser Supabase |
| `MERCADO_PAGO_ACCESS_TOKEN`   | Token privado da aplicação e ambiente correto                                  |
| `MERCADO_PAGO_WEBHOOK_SECRET` | Assinatura secreta da configuração de webhook                                  |
| `MERCADO_PAGO_SELLER_ID`      | ID da conta vendedora, conferido na criação e em cada confirmação              |
| `MERCADO_PAGO_MODE`           | `test` por padrão; `production` somente após os testes oficiais                |
| `SUPABASE_URL`                | URL do projeto Supabase Auth/Storage                                           |
| `SUPABASE_SERVICE_ROLE_KEY`   | Chave administrativa; somente servidor                                         |
| `SUPABASE_STORAGE_BUCKET`     | Nome do bucket privado, padrão `music-library`                                 |
| `RESEND_API_KEY`              | Chave de envio do Resend                                                       |
| `EMAIL_FROM`                  | Remetente com domínio verificado; formato `Music Library <seu endereço real>`  |
| `SUPPORT_EMAIL`               | Endereço real para suporte e Reply-To                                          |
| `EMAIL_LINK_ENCRYPTION_KEY`   | 32 bytes hexadecimais; criptografa o link temporário na fila de e-mail         |
| `FRONTEND_URL`                | Origem do frontend, usada nos retornos e CORS                                  |
| `BACKEND_URL`                 | Origem pública da API, para configurar o webhook no painel                     |
| `CHECKOUT_ENABLED`            | `false` até validar a operação; `true` abre a criação de pedidos               |
| `PORT`, `HOST`                | Escuta da API; padrão `127.0.0.1:3001`                                         |
| `VITE_SUPABASE_URL`           | URL pública do mesmo projeto Supabase                                          |
| `VITE_SUPABASE_ANON_KEY`      | Somente chave pública anon/publishable de autenticação                         |
| `VITE_API_URL`                | Vazio para mesma origem; para outra origem, URL pública da API sem `/api`      |
| `VITE_PUBLIC_SITE_URL`        | Origem pública para metadados da landing page                                  |

Gere a chave de criptografia localmente:

```sh
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Guarde-a com os segredos e backups. Perdê-la impede recuperar links pendentes de envio. Nenhuma variável privada pode receber prefixo `VITE_`.

## PostgreSQL e catálogo

Para configurar a conexão local sem enviar a senha por chat, copie a URI de **Connect → Session pooler → URI** para `DATABASE_URL` no `.env`, mantendo `[YOUR-PASSWORD]`. Salve o arquivo e execute no terminal interativo do projeto:

```sh
npm run db:configure
```

O comando recebe a senha sem exibi-la, codifica caracteres especiais, exige SSL e testa a conexão com `SELECT 1`. Somente após sucesso grava a URI, as URLs públicas do projeto e uma chave interna de criptografia, caso ainda esteja vazia. Não imprime credenciais, não cria tabelas e preserva o `.env` se a verificação falhar. Se o editor avisar que o arquivo mudou no disco, recarregue a versão salva pelo comando.

```sh
npm ci
npm run db:generate
npm run db:migrate
npm run db:seed
```

As migrações criam `users`, `products`, `orders`, `payments`, `entitlements`, `webhook_events`, `jobs` e `library_assets`, com unicidade por tentativa, order externa, pagamento e concessão por pedido. Datas usam `timestamptz` para a fila funcionar em qualquer fuso.

RLS é habilitada sem políticas públicas nessas tabelas. A conexão do backend deve usar o proprietário das tabelas ou um papel de servidor com acesso. O frontend consulta exclusivamente a API, sem permissão direta para alterar pedidos ou acessos.

O seed cria os dois planos de violino e mantém os produtos antigos arquivados. A migração `202610240005_violin_offers` cria 25 partituras sem playbacks por R$ 12,90 e 100 partituras com playbacks por R$ 27,90 no lançamento. A regra compartilhada em `shared/violin-launch.ts` altera o Completo para R$ 49,90 a partir de 28/10/2026, no horário de Brasília. A chave global `CHECKOUT_ENABLED` continua controlando a abertura das compras. Reexecutar o seed não altera produtos existentes. Para impedir uma venda específica, use `products.available=false`. `npm start` aplica as migrações pendentes antes de iniciar a API.

## Mercado Pago Developers

1. Crie/selecione sua aplicação em **Suas integrações**, para Checkout Pro via Orders API. Use o fluxo e as credenciais de teste da documentação da aplicação. Se a conta não tiver acesso a Orders, resolva a habilitação no painel; o código não troca silenciosamente para Preferences.
2. Configure token de teste e `MERCADO_PAGO_SELLER_ID` da conta vendedora. O servidor rejeita IDs `ORDTST` no modo produtivo e IDs produtivos no modo teste.
3. Disponibilize a API por HTTPS, podendo usar túnel no desenvolvimento. Configure as origens públicas em `BACKEND_URL` e `FRONTEND_URL`.
4. Em **Webhooks → Configurar notificações**, registre `${BACKEND_URL}/api/webhooks/mercadopago` e selecione **Order (Mercado Pago)**. Configure contestações conforme a documentação Orders, que reporta `order.charged_back` no tópico `order`. Não habilite tópicos legados neste endpoint.
5. Copie a assinatura secreta para `MERCADO_PAGO_WEBHOOK_SECRET`; não confunda com o access token.
6. O endpoint exige `data.id` na query, `x-signature`, `x-request-id` e corpo do tópico `order`. Valida pelo SDK oficial, usando o ID em minúsculas na assinatura conforme o contrato. O ID do corpo deve coincidir com o ID assinado.
7. Use **Simular notificação** para verificar entrega. Uma simulação com ID fictício pode receber HTTP 200 por ter sido persistida, mas o job não aprova nada se a order não existir no provedor e no banco. Valide a fila, não só o HTTP.

Os retornos ficam em `config.online.success_url`, `pending_url` e `failure_url`, com `auto_return: all`. Nenhum parâmetro de retorno concede acesso.

## Supabase Auth e Storage

1. Configure um projeto com provedor de e-mail habilitado. O servidor usa `generateLink(type: magiclink)`, criando usuário ausente ou reutilizando a conta existente. Não envia senhas.
2. Cadastre `${FRONTEND_URL}/biblioteca` em **Authentication → URL Configuration → Redirect URLs** e configure a Site URL. Faça o mesmo para desenvolvimento, se necessário.
3. Configure a duração do link no Auth para a janela operacional de envio. Um link expirado pode ser substituído pela opção **Receber link de acesso** na biblioteca.
4. No frontend, use apenas URL e chave pública anon/publishable. O servidor verifica a sessão por `auth.getUser`; dados do navegador não autorizam downloads.
5. Crie o bucket `music-library` como **privado**, sem políticas de leitura pública ou acesso direto por usuários autenticados. Após validar direitos no banco, o servidor gera URLs de 60 segundos para download ou 10 minutos para reprodução e visualização.
6. Publique somente arquivos comerciais autorizados. A prévia de `public/` continua demonstrativa.

Adapte [library-manifest.example.json](library-manifest.example.json). Os caminhos `file` são relativos ao manifesto:

```sh
npm run library:import -- caminho/do/manifesto.json
```

O importador exige bucket privado, aceita PDF/PNG para partituras e MP3/WAV para áudios, e não sobrescreve objetos. Metadados registrados podem ser atualizados sem reenviar arquivo. Se o upload ocorreu, mas o registro no banco falhou, confira o objeto órfão no painel antes de repetir; a CLI evita substituição silenciosa.

Use os mesmos `songTitle`, `artist` e `instrument` nos arquivos da mesma música para reuni-los na mesma linha. `style` alimenta o filtro de estilo; campos antigos sem metadados continuam disponíveis pelo `title`. A biblioteca privada oferece busca por música/artista, filtros de instrumento/estilo, áudio com controles e partitura com zoom. PDFs são renderizados na página com PDF.js, com navegação por páginas; PNGs são exibidos diretamente. Várias versões da partitura ou do áudio podem ser escolhidas no mesmo painel.

A rota `/api/library/assets/:id/view` aplica a mesma autenticação, compra aprovada, instrumento e revogação de `/download`. As URLs são solicitadas ao abrir o material; a ação “Renovar acesso ao arquivo” revalida o direito e substitui uma URL expirada. URLs temporárias não são persistidas no navegador. Aplique a migração `202610240001_library_repertoire` antes de publicar o novo servidor.

Completo permite os seis instrumentos; individual permite os arquivos daquele instrumento. Não publique materiais comerciais em `public/`, nem exponha chaves do storage em respostas.

### Acesso temporário para revisão

O operador pode liberar uma conta específica para revisar os materiais de um instrumento, sem criar pedido, pagamento ou concessão de compra:

```sh
npm run library:grant-preview -- --email pessoa@example.com --instrument violin --hours 48
```

A CLI prepara a identidade no Supabase e registra `library_preview_access` com RLS e prazo de 1 a 168 horas (padrão: 48). Ela não envia e-mail. A pessoa solicita o link pela tela `/biblioteca`; o servidor verifica a identidade, o instrumento, o prazo e a revogação antes de mostrar arquivos ou emitir URLs. O login retorna a mesma mensagem genérica para e-mails sem acesso. Para interromper a revisão antes do prazo, o operador define `revokedAt` no registro. A expiração/revogação não remove uma compra válida da mesma conta.

## Resend

Verifique o domínio do remetente e configure `RESEND_API_KEY`, `EMAIL_FROM` e `SUPPORT_EMAIL`. O e-mail de confirmação contém HTML/texto, produto, instruções, botão, link pessoal fixo e suporte.

O envio ocorre depois da concessão do acesso. Se falhar, o acesso permanece e a fila tenta novamente. O link fica temporariamente criptografado para repetir o mesmo payload e chave `purchase/{orderId}`, sendo removido após envio ou estorno. A deduplicação do provedor é limitada à retenção do Resend; não garante entrega única após indisponibilidade prolongada.

Compradores com acesso podem solicitar o mesmo link em `/biblioteca`. A resposta é genérica, sem divulgar se o endereço possui conta. E-mails de login usam outro assunto e não simulam nova compra. O status `Delivered` do Resend confirma aceitação pelo servidor do destinatário; a pasta de destino é definida pelo provedor de e-mail.

### Link pessoal fixo

Após aplicar `202610240003_library_access_links`, cada conta recebe um único endereço `/biblioteca#id=UUID&acesso=SEGREDO`, reutilizado em novas compras e solicitações por e-mail. O ID é diferente do ID do usuário; o segredo aleatório tem 256 bits. O fragmento não é enviado no pedido da página nem no Referer. O cliente envia ID/segredo no corpo de `POST /api/auth/access`, sem persistir o segredo em armazenamento local.

O banco guarda o hash para validação e uma cópia criptografada com `EMAIL_LINK_ENCRYPTION_KEY` para reenviar o mesmo endereço. RLS não permite leitura direta pelo navegador. A troca verifica compra aprovada ou prévia ativa antes de gerar um acesso temporário Supabase. A sessão resultante continua sujeita às verificações de instrumento, prazo e revogação em cada leitura. O link pessoal não concede uma compra e não mantém ativo um acesso de teste expirado.

Quem possui o link completo pode entrar naquela conta: não publique URLs pessoais em logs ou páginas públicas. Na biblioteca, “Copiar meu link pessoal” permite guardar o endereço nos favoritos. Para substituí-lo após compartilhamento indevido, use a CLI administrativa; o ID permanece e o segredo anterior deixa de funcionar:

```sh
npm run library:personal-link -- --email pessoa@example.com --rotate --out novo-link.local
```

Sem `--rotate`, a CLI recupera o mesmo endereço. Ela exige acesso ativo e não envia e-mail. O arquivo `.local` é privado e ignorado pelo Git. Substituir o link não encerra sessões já autenticadas; para encerrá-las, revogue também as sessões da conta pelo provedor. Os e-mails não incluem mais URLs Supabase de uso único como endereço a guardar.

## Testes locais e teste oficial

```sh
npm test
npm run typecheck
npm run lint
npm run build
```

A suíte inicia PostgreSQL temporário em porta livre com autenticação local, aplica migrações reais e remove seus próprios dados ao terminar. Não usa a `DATABASE_URL` operacional. A dependência de desenvolvimento inclui binários PostgreSQL. Em Linux, execute como usuário sem privilégios de root.

Serviços externos são substituídos por doubles controlados. Os testes cobrem checkout, preço manipulado, indisponibilidade, idempotência concorrente, pendente/aprovado/rejeitado/cancelado, assinatura incorreta, referência/produto/moeda/conta/valor incompatíveis, conta existente, falha de e-mail, estornos, ordem de eventos e autorização de downloads.

Antes de qualquer pagamento real:

1. Configure contas de teste e HTTPS; mantenha `MERCADO_PAGO_MODE=test`.
2. Inicie API e frontend e use `CHECKOUT_ENABLED=true` somente no ambiente de testes.
3. Com comprador de teste diferente do vendedor, escolha produto e confirme a URL oficial do checkout.
4. Use cartões e cenários da [documentação oficial](https://www.mercadopago.com.br/developers/pt/docs/checkout-pro-orders/integration-test/test-purchase-with-card): aprovado, pendente e rejeitado. Não use cartão real.
5. Confirme webhook assinado, consulta da order e gravação em `payments`/`orders`.
6. Para aprovado, confirme uma concessão, conta Supabase e e-mail recebido. Teste login/download correto e recusa para outro instrumento.
7. Repita a notificação e compre outro produto com a mesma conta. Não deve haver concessão duplicada por pedido.
8. Teste reembolso/contestação no ambiente suportado e confirme revogação. Uma segunda compra válida mantém seu próprio direito.
9. Revise celular/desktop, suporte, termos, privacidade e materiais comerciais.
10. Somente então configure credenciais, vendedor e webhook de produção e altere o modo. A API exige HTTPS no modo produtivo.

Sem credenciais externas, esse teste oficial permanece **pendente**. A suíte local não representa compra real nem teste no ambiente oficial do Mercado Pago.

## Operação e recuperação

A biblioteca, a abertura do link pessoal, a solicitação de e-mail e a emissão
de URLs para visualizar materiais aguardam até 90 segundos pela API. Isso
acomoda a inicialização de uma instância após inatividade sem encerrar a sessão.
Após oito segundos de espera pelo catálogo privado, a interface informa que os
materiais estão sendo preparados. A espera continua limitada: se terminar sem
resposta, o cliente pode usar "Tentar novamente". Não há repetição automática de
solicitações que enviam e-mail nem alterações na validação dos direitos de acesso.

Retornar à aba e renovar a autenticação da mesma conta preserva o catálogo,
os filtros e o material aberto. A consulta inicial da biblioteca acompanha a
identidade da conta, sem reiniciar a cada evento `SIGNED_IN` ou troca do token.
Arquivos já abertos mantêm sua URL temporária; novas aberturas e a ação de renovar
o arquivo usam a credencial atual. Sair ou trocar de conta limpa os materiais e
cancela consultas antigas. A renovação automática de autenticação continua ativa.

O checkout exige o e-mail de entrega antes de criar a cobrança. A migração
`202610240004_checkout_delivery_email` adiciona `orders.deliveryEmail`, separado
do e-mail que o provedor eventualmente retorna em `payer`. O destinatário é
normalizado, fica vinculado à tentativa e é enviado em `payer.email` na criação
da Order. Alterar o destinatário exige uma nova tentativa; a consulta pública de
status nunca expõe esses endereços.

Uma Order Pix liquidada pode retornar sem `payer`, inclusive após a aprovação.
As verificações financeiras continuam exigindo `processed/accredited`, conta,
referência, itens, moeda e valores exatos; a ausência de e-mail não transforma
um pagamento liquidado em pendente. A entrega usa o destinatário registrado no
checkout ou, para pedidos antigos, o e-mail válido do provedor. Se ambos estiverem
ausentes, o pedido fica aprovado e a entrega aguarda recuperação administrativa
do destinatário, sem inventar endereço nem liberar materiais a terceiros.

Defina `NODE_ENV=production` na hospedagem. Isso também desativa os logs de diagnóstico do SDK do Resend que só são úteis no desenvolvimento local.

`npm start` inicia API e fila a cada dois segundos. Exige processo Node persistente; hospedagem estática sozinha não executa o backend. Em containers, configure `HOST=0.0.0.0` e a porta da hospedagem.

O webhook responde 200 depois de gravar evento e job na mesma transação. O worker usa leases, `FOR UPDATE SKIP LOCKED`, bloqueio por pedido e intervalo crescente de retentativas, até uma hora. Falhas permanecem pendentes com `PROCESSING_FAILED`, sem armazenar respostas sensíveis. Leases expiram após dois minutos em caso de queda.

Monitore jobs com `doneAt IS NULL`, tentativas e idade. Orders externas sem correspondência permanecem pendentes para investigação. Para notificação perdida, reconcilie administrativamente com as mesmas verificações:

```sh
npm run checkout:reconcile -- IDENTIFICADOR_ORD_REAL
```

A tentativa usa UUID/token aleatório em `sessionStorage`. O servidor só a reaproveita se produto/token coincidirem; o SDK recebe UUID estável para evitar duplicar a order externa. Status exige token, não mostra dados pessoais e ignora `status=approved` da URL. Outro navegador pode pedir acesso por e-mail.

Para revisar um pedido já criado sem abrir vendas públicas, o operador pode entregar `/checkout/pending?order=UUID&iniciar=1#token=TOKEN`. O cliente guarda o token de consulta na sessão e remove o fragmento da barra; o servidor só retorna o preço e a URL de pagamento ao portador desse token. A página exibe o total e um botão para continuar ao domínio oficial do Mercado Pago. Não aprova o pedido, não cria outra cobrança e não abre o checkout público. Pedidos finalizados ou com mais de 23 horas não recebem URL para retomada. O retorno do Mercado Pago recupera o token da mesma sessão do navegador para consultar a confirmação.

Após aprovação e concessão ativa deste pedido, a consulta autenticada pelo token
também retorna `personalLink`: o mesmo endereço fixo enviado por e-mail. A tela
de confirmação permite abrir, selecionar e copiar o link. Pedidos pendentes,
sem concessão ou estornados recebem `null`; token inválido recebe 404. O navegador
aceita somente o endereço `/biblioteca` na própria origem, com as credenciais no
fragmento. O link nunca depende do parâmetro `status` recebido na URL de retorno.

As URLs de retorno e `auto_return: all` são configuradas na Order. A navegação
na página externa, inclusive o botão de voltar durante um Pix, pertence ao
Mercado Pago. A identidade visual também depende da conta vendedora: em
Configurações → Conta → Personalização do checkout, configure o nome Music
Library e a imagem pública `/images/music-library-logo.png`. O PNG exporta a
marca já usada no site; publicar a imagem não altera o perfil da conta.

Orders recém-criadas podem não trazer `status_detail`. Nesse caso, o detalhe é normalizado para vazio e o pedido permanece pendente. A aprovação continua exigindo explicitamente `processed/accredited`, valores e identidade da compra correspondentes.

Preço/código são copiados no pedido para preservar a compra após mudanças no catálogo. A aprovação exige `processed/accredited`, valor total/pago exato, BRL, item/quantidade, referência e conta correspondentes. Estados antigos não regridem aprovação; estornos são terminais e não reativam por notificações atrasadas. Reembolso parcial também suspende o acesso por política conservadora, sujeita à revisão comercial.

Há rate limiting por processo e CORS restrito. Com múltiplas instâncias/proxy, configure limitação compartilhada no gateway e IPs somente de proxies confiáveis. O código não confia indiscriminadamente em `X-Forwarded-For`.

Configure fallback de `/checkout/*` e `/biblioteca` para `index.html`, preserve `/api/*` no proxy e não cacheie a API. A página define referrer `no-referrer`. Configure logs de proxy sem Authorization, tokens ou corpos sensíveis. Banco, chaves e `.env` não são públicos.

Uma URL de download emitida pode funcionar por até 60 segundos após revogação; para reprodução/visualização, até 10 minutos. Novas URLs serão negadas. Arquivos já carregados no dispositivo não podem ser recolhidos. A biblioteca mostra estado vazio se os materiais não foram importados, sem prometer arquivos inexistentes.
