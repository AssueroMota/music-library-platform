# Music Library Platform

Primeira versão da landing page da Music Library: uma biblioteca musical premium em preparação, criada de músico para músico.

**Escopo:** apresentação pública e demonstração local. Não há backend, banco de dados, autenticação, checkout real, cobrança ou biblioteca privada.

## Executar localmente

Requisitos: Node.js 22.12 ou superior e npm. Validado com Node.js 22.23.

```sh
git clone https://github.com/AssueroMota/music-library-platform.git
cd music-library-platform
npm ci
npm run dev
```

Abra a URL exibida pelo Vite, normalmente `http://localhost:5173`. Não é necessário configurar credenciais ou serviços externos.

```sh
npm run build        # TypeScript e build de produção em dist/
npm run preview      # Servir o build localmente
npm test             # Testes de interação em ambiente DOM
npm run typecheck    # Verificação de tipos
npm run format       # Formatar o código com Prettier
npm run assets:audio # Regenerar os áudios originais
```

## Experiência implementada

- Quinze seções: barra superior, header sticky, hero, instrumentos, comparação de áudio, benefícios, biblioteca, ocasiões, como funciona, comparação, planos, propósito, FAQ, chamada final e rodapé.
- Vite, React, TypeScript estrito, Tailwind CSS, Lucide React e Motion.
- Identidade em azul-marinho, dourado e off-white, CTAs verdes, imagens locais dos seis instrumentos e mockup construído em React.
- Menu mobile com estado expandido, fechamento por Escape e devolução de foco.
- Seleção de instrumentos sincronizada com a prévia da biblioteca.
- Busca sem diferenciar maiúsculas/acentos; filtros combinados por instrumento, estilo e tonalidade; seleção de estudo e estado vazio.
- Favoritos locais em memória, reiniciados ao recarregar.
- Players HTML Audio com play, pause, progresso, duração e coordenação para evitar reprodução simultânea.
- Dois estudos originais com versões de acompanhamento e melodia sintetizada, sem músicas comerciais.
- Planos tipados com preço, modalidade e `checkoutUrl` opcionais. Sem URL, os botões explicam que a modalidade está em preparação.
- FAQ com `details`/`summary`, modais com `dialog`, foco visível, link de salto e respeito a movimento reduzido.
- Fontes locais, imagens secundárias lazy, metadados em português, Open Graph, favicon e configuração opcional de canonical.

## Estrutura

```text
public/
  audio/                      WAVs originais da demonstração
  images/                     Instrumentos e capa Open Graph
  favicon.svg
src/
  components/
    Header.tsx                Navegação desktop e mobile
    HeroSection.tsx           Apresentação e mockup visual
    InstrumentSelector.tsx    Cartões e descrição da seleção
    AudioComparison.tsx       Comparação entre os dois áudios
    AudioPlayer.tsx           Player reutilizável com src/label
    BenefitsSection.tsx       Benefícios e recursos planejados
    LibraryPreview.tsx        Busca, filtros, lista e favoritos
    Score.tsx                 Partitura ilustrativa em SVG
    RepertoireCategories.tsx  Categorias editoriais planejadas
    JourneySections.tsx       Etapas futuras e comparação
    PricingSection.tsx        Planos configuráveis
    ClosingSections.tsx       Sobre, FAQ, CTA e footer
    InfoDialog.tsx            Modal informativo
    ui.tsx                    Button, Container, Logo e headings
  data/content.ts             Dados locais e textos
  test/                       Testes de integração em JSDOM
  types.ts                    Contratos de dados tipados
  index.css                   Tailwind, tokens e breakpoints
  App.tsx                     Página e estado compartilhado
  main.tsx                    Entrada React
scripts/
  generate-demo-audio.mjs      Síntese determinística dos estudos
docs/
  assets.md                   Origem dos materiais e prompt
  next-phase.md               Integrações e publicação futura
```

## Atualizar conteúdo

Edite `src/data/content.ts`. Os componentes de apresentação não dependem de uma API. Os contratos em `src/types.ts` permitem substituir os dados locais por um serviço de catálogo na próxima fase.

Para áudio real, configure `Track.audio.backing` e `Track.audio.lead` com arquivos autorizados. `AudioPlayer` recebe a URL por propriedade e trata falhas de reprodução. Os estudos atuais são compartilhados entre os instrumentos apenas para demonstrar a navegação; não constituem arranjos transpostos para cada um.

Os planos estão em `plans`. Preencha `price` e `checkoutUrl` apenas quando houver condições comerciais definidas e checkout real. Revise os avisos de desenvolvimento somente após concluir as integrações correspondentes.

## SEO e hospedagem

O build estático em `dist/` está preparado para a raiz de um domínio. Não houve implantação de hospedagem nesta entrega. No domínio definitivo, copie `.env.example` para `.env.local` e configure `VITE_PUBLIC_SITE_URL`: isso adiciona canonical, `og:url` e imagem Open Graph absoluta. Nenhum domínio de produção foi inventado.

A configuração segue a documentação oficial de [Vite](https://vite.dev/guide/) e [Tailwind com Vite](https://tailwindcss.com/docs/installation/using-vite).

## Validação e limites

- `npm run build`: compilação TypeScript e empacotamento de produção verificados.
- `npm test`: cinco testes de interação cobrindo filtros combinados, estados vazios, sincronização de instrumento, favoritos, Escape, aviso de plano e coordenação dos players.
- O servidor de desenvolvimento respondeu HTTP 200.
- JSDOM usa mídia simulada: os testes não validam a reprodução audível ou o layout em navegador real.
- A revisão visual pelo Chrome não pôde ser concluída: a automação interrompeu a sessão por não conseguir confirmar a URL da aba. Conferir os breakpoints em navegador real antes da publicação.

Consulte [a próxima fase](docs/next-phase.md) para backend, pagamentos, autenticação, permissões, PDFs, catálogo comercial, e-mails e administração. A origem das imagens, áudios, fontes e ícones está em [materiais](docs/assets.md).
