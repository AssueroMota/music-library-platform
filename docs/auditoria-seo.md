# Auditoria SEO da Music Library

Verificação de 18 de novembro de 2026. O diagnóstico descreve o domínio publicado. As melhorias foram validadas no build e no preview locais, antes de qualquer publicação.

## Diagnóstico

| Área | Evidência no site publicado |
| --- | --- |
| Arquitetura | React com Vite. A Vercel publica `dist/` com rewrites individuais para a área do aluno e os retornos de checkout. A API usa outro domínio. |
| Conteúdo entregue | A home respondeu com HTTP 200, `lang="pt-BR"`, viewport, título, descrição, canonical e Open Graph. O HTML inicial continha uma raiz React vazia. No Chrome, o JavaScript montou um H1, 15 H2 e 20 H3. O H1 trazia o slogan da marca, com o produto descrito no parágrafo seguinte. |
| Metadados | A canonical da home já apontava para o domínio `www`. A imagem social pública de 1200 × 630 respondeu com HTTP 200. A Twitter Card declarava o formato e dependia dos campos Open Graph para os demais dados. O HTML inicial veio sem JSON-LD. |
| HTTPS e duplicatas | O domínio sem `www` em HTTPS redirecionou com 308 para `www`. Os dois endereços HTTP redirecionaram para HTTPS. `/index.html`, a home com parâmetros de campanha e o endereço padrão da Vercel responderam com 200 e indicaram `/` no domínio canônico. Uma URL inexistente e `/login` responderam com 404. |
| Rotas privadas | `/biblioteca` e os três retornos de checkout estavam fora do sitemap e respondiam com 200, usando a canonical da home e sem instrução `noindex`. A API da biblioteca respondeu com 401 à consulta anônima. A proteção dos materiais depende da autorização da API. |
| Rastreamento | `robots.txt`, `sitemap.xml` e o arquivo de verificação do Google responderam com 200. O sitemap publicado lista a home, e o `robots.txt` anuncia o sitemap sem bloquear a área pública. |
| Desempenho | A home já reservava as dimensões das imagens e usava carregamento tardio em peças abaixo da primeira tela. O título da home começava em um contêiner animado com opacidade zero. A foto principal tinha 530.944 bytes. O Chrome solicitou o MP4 de apresentação no carregamento inicial para ler metadados, antes de a seção aparecer. A fonte Inter é servida pelo próprio site. |
| Oferta | A API pública confirmou R$ 12,90 no Básico e R$ 49,90 no Completo, com o checkout habilitado. O catálogo do projeto conta 116 partituras e 36 guiadas, somando 152 no Completo, além de 116 playbacks. O texto dos planos confirma pagamento único e ausência de mensalidade. Uma arte de capa mostrava 151 partituras e 35 guiadas, e uma resposta da FAQ ainda apresentava o lançamento encerrado como oferta atual. |

## Melhorias e arquivos

| Área | Alterações |
| --- | --- |
| Home e build | `index.html`, `app.html`, `package.json`, `vite.config.ts`, `vercel.json`, `scripts/build-web.mjs`, `src/entry-prerender.tsx`, `src/HomePage.tsx`, `src/home.tsx` e `src/App.tsx` entregam HTML pré-renderizado na home e mantêm uma entrada React separada com `noindex` para a biblioteca e o checkout. A Vercel recebe um 308 explícito de `/index.html` para `/`. O preview local usa os mesmos caminhos de redirecionamento e rewrite. |
| Conteúdo e metadados | `index.html`, `src/components/HeroSection.tsx`, `src/components/OfferContents.tsx` e `src/data/sales.ts` atualizam o H1, a descrição, os links internos e a FAQ. A imagem de compartilhamento da marca tem URL absoluta. A capa sem contagens substitui a arte promocional desatualizada. |
| Hidratação e mídia | `src/components/ClosingSections.tsx`, `src/lib/use-offer-pricing.ts`, `src/components/ui.tsx`, `src/styles/violin.css` e `src/styles/offer-contents.css` mantêm a estrutura estável entre o HTML do build e o React. O relógio do preço volta ao horário do navegador quando a página hidrata. Leitores sem JavaScript e usuários que preferem movimento reduzido conseguem ler as seções animadas. `src/components/PresentationVideo.tsx` evita a solicitação antecipada do MP4. `src/data/violin-sales.ts` e `public/images/violin-event.webp` reaproveitam a foto já creditada, agora com 342.320 bytes, cerca de 36% a menos. |
| Guias e rastreamento | `repertorio-para-violino.html`, `partituras-guiadas-para-violino.html`, `src/styles/public-guides.css` e `public/sitemap.xml` acrescentam duas páginas estáticas, com metadados próprios e navegação interna. O `robots.txt` continua anunciando o sitemap e o arquivo de verificação permanece intacto. |
| Documentação e teste | `.env.example`, `README.md` e `docs/vercel.md` refletem o canonical fixo e o roteamento. `src/test/interactions.test.tsx` acompanha o novo H1. |

A regra comercial, as integrações de pagamento, o backend e a lógica de autenticação e acesso ficaram fora das alterações.

## Páginas públicas

- **`/repertorio-para-violino`** ajuda a montar sequências para cerimônias, jantares, celebrações e apresentações. Os exemplos vêm do catálogo público de clássicos, MPB, pop e gospel. A seleção é editorial e traz critérios práticos de duração, transição e ensaio.
- **`/partituras-guiadas-para-violino`** explica a diferença entre partitura, vídeo guiado e playback. O roteiro de estudo aborda entradas, pausas e trechos difíceis. Os exemplos de títulos e artistas constam do catálogo guiado.
- A home cobre a intenção comercial de **partituras para violino**. Os guias já cobrem o uso de **playbacks** e a escolha por **gênero**. Uma página separada sobre playback ou sobre um estilo fica condicionada a uma necessidade observada e a conteúdo próprio que aprofunde o assunto. Os guias publicados pelo build usam texto e imagens da marca, sem anexar partituras, áudio ou vídeo.

## Dados estruturados e validação

- A home contém `Organization` e `WebSite`, com URL oficial, imagem pública da marca e vínculo entre os dois nós. Os guias usam `BreadcrumbList` com dois itens e uma trilha de navegação visível. A sintaxe JSON, as referências e as URLs foram conferidas no HTML servido. [Organização](https://developers.google.com/search/docs/appearance/structured-data/organization) · [Nome do site](https://developers.google.com/search/docs/appearance/site-names) · [Breadcrumbs](https://developers.google.com/search/docs/appearance/structured-data/breadcrumb)
- `Product` e `Offer` ficam reservados a uma página dedicada a um produto ou variante elegível, com preço e disponibilidade coerentes com o checkout. A home compara planos e os guias são editoriais. [Requisitos para rich results de produtos](https://developers.google.com/search/docs/appearance/structured-data/product-snippet)
- `npm run lint` e `npm run typecheck` passaram. O lint relatou avisos preexistentes em seis pontos do código e nos scripts locais de `tmp/`. O build completo passou. A suíte do frontend passou com 146 testes e a do backend com 79.
- O preview respondeu com 200 para as três páginas públicas, a entrada da biblioteca, os três retornos de checkout e os arquivos SEO. A rota `/index.html` respondeu com 308 e rotas inexistentes responderam com 404 no preview estático. O XML foi validado pelo esquema oficial. Canonical, idioma, viewport, headings, imagens sociais, `noindex` e URLs do sitemap foram checados nas respostas HTTP. [Esquema do sitemap](https://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd)
- No Chrome, as três páginas públicas ficaram legíveis sem JavaScript em 320, 390 e 1440 px. Com JavaScript, foram verificados hidratação, navegação, busca na demonstração, abertura da opção grátis e do checkout, entrada da biblioteca e retornos sem pedido. A validação local usou respostas simuladas para a API nos fluxos de interação e não iniciou compras.
- Uma amostra de laboratório em 390 px registrou LCP de aproximadamente 1,64 s e CLS 0 no site publicado. Uma amostra no preview local registrou LCP de aproximadamente 0,34 s e CLS 0. As condições de rede e hospedagem são diferentes. O HTML inicial agora contém o H1, e o teste local confirmou que o MP4 só foi necessário fora do carregamento inicial. INP e percentis de campo dependem de dados reais. [Medição de Core Web Vitals](https://web.dev/articles/vitals)

## Pendências e próximos 30 dias

O proprietário informa que a home já está indexada. A inspeção no Search Console, o estado de indexação dos guias, dados CrUX e a validação nas ferramentas externas de rich results seguem pendentes. Os avisos do rodapé agora descrevem a compra, o pagamento e o uso do e-mail para acesso. A aprovação das versões integrais dos Termos de Uso e da Política de Privacidade segue pendente. O vídeo de apresentação ainda precisa de uma faixa de legendas revisada. Qualquer novo material de demonstração precisa de autorização de divulgação. Se o preço inicial mudar, revise também a descrição da home e gere um novo build.

| Período | Prioridade |
| --- | --- |
| Dias 1–3 | Após autorização e deploy, testar as três URLs canônicas e os arquivos SEO no domínio final. Confirmar os redirecionamentos, os retornos de checkout, a biblioteca e os breadcrumbs. No Search Console, reenviar o sitemap, rodar a inspeção ao vivo da home e dos guias e solicitar indexação das URLs novas. |
| Dias 4–10 | Conferir o processamento do sitemap e a canonical selecionada nas três páginas. Validar os breadcrumbs no teste de pesquisa aprimorada e a organização e o site no Schema Markup Validator. Revisar e aprovar os textos integrais de Termos de Uso e Política de Privacidade. |
| Dias 11–20 | Filtrar o relatório de desempenho por Brasil e dispositivo móvel. Acompanhar impressões, cliques e CTR por consulta e URL. Usar PageSpeed Insights e o relatório de Core Web Vitals para estabelecer um ponto de partida de campo, conforme a disponibilidade de amostras. |
| Dias 21–30 | Comparar o desempenho das páginas com o ponto de partida, inclusive cliques nos planos e acessos à demonstração se já houver medição. Priorizar novos guias por demanda demonstrada e por material autorizado. Verificar cobertura e canônicas após mudanças de catálogo. |
