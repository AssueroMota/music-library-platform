# Frontend na Vercel

Domínio canônico do site

`https://www.partiturasebases.com.br/`

O `vercel.json` usa Vite, executa `npm run build:web` e publica `dist/`. O build pré-renderiza a home, mantém os guias em HTML estático e encaminha a biblioteca e os retornos do checkout para `app.html`, com `noindex`. O sitemap, o robots.txt e o arquivo de verificação são servidos como arquivos estáticos. A API e a fila rodam em hospedagem própria.

## Variáveis do projeto frontend

Configure em **Vercel → projeto → Settings → Environment Variables**:

| Nome                     | Valor                                                                 |
| ------------------------ | --------------------------------------------------------------------- |
| `VITE_SUPABASE_URL`      | URL pública do projeto Supabase, já configurada no `.env` local       |
| `VITE_SUPABASE_ANON_KEY` | Publishable key do Supabase, já configurada no `.env` local           |
| `VITE_API_URL`           | Origem HTTPS da API quando ela estiver publicada, sem `/api` no final |

Use somente as variáveis públicas acima no projeto de frontend. Access Token do Mercado Pago, Secret key do Supabase, conexão PostgreSQL, chave de criptografia, segredo do webhook e chave do Resend pertencem ao backend. Não importe o `.env` inteiro para esse projeto.

Enquanto não houver API publicada, deixe `VITE_API_URL` sem configurar: o checkout informará indisponibilidade. Configurar uma URL fictícia não habilita pagamentos.

## Código publicado

O repositório vinculado à Vercel precisa conter a implementação atual, incluindo `vercel.json`, `shared/`, as novas páginas e os componentes do checkout. Uma publicação baseada em um commit antigo não inclui alterações que ainda estejam apenas no computador.

Depois de sincronizar o código e configurar as variáveis, faça um novo deployment. Alterações em `VITE_*` só entram no frontend após novo build.

## Supabase Auth

Em **Authentication → URL Configuration**, configure:

- **Site URL:** `https://music-library-platform-six.vercel.app`
- **Redirect URLs:** `https://music-library-platform-six.vercel.app/biblioteca`
- Para continuar os testes locais, mantenha também `http://localhost:5173/biblioteca` na lista.

Na API hospedada, `FRONTEND_URL` precisa ser `https://music-library-platform-six.vercel.app`, para CORS e links de retorno/autenticação.

## Validação depois do deploy

Confira `/`, `/repertorio-para-violino`, `/partituras-guiadas-para-violino`, `/sitemap.xml` e `/robots.txt`. Verifique também `/biblioteca` e as três rotas de retorno `/checkout/success`, `/checkout/pending` e `/checkout/failure`. Sem um pedido válido, o retorno deve orientar o usuário e nunca exibir pagamento aprovado.

Quando a API estiver publicada, confira o health check e a consulta de produtos antes de habilitar checkout de teste. O webhook exige URL HTTPS da API; o domínio do frontend sozinho não fornece esse endpoint.

Consulte também [checkout.md](checkout.md) para configurar Resend, notificações, materiais comerciais e teste oficial de compra. As vendas seguem desativadas até concluir essas etapas.
