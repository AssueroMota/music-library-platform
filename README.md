# Music Library Platform

Landing page de venda de partituras e backing tracks, com entrega digital planejada e organização em pastas.

## Executar

Requisitos: Node.js 22.12+ e npm.

```sh
npm ci
npm run dev
```

Abra a URL exibida pelo Vite, normalmente `http://localhost:5173`.

```sh
npm run build        # TypeScript e produção em dist/
npm run preview      # Servir a versão de produção localmente
npm test             # Seis testes de interação em JSDOM
npm run typecheck    # Verificar tipos
npm run format       # Formatar com Prettier
npm run assets:audio # Regenerar os estudos originais
```

## Página

O fluxo foi reduzido a cinco blocos: oferta com preço inicial e botão para os planos, amostra de áudio, material e entrega, comparação Básico/Completo e quatro dúvidas essenciais. A prévia da organização por pastas aparece apenas ao expandir “Ver como os materiais ficam organizados”. As animações respeitam a preferência por movimento reduzido.

A tipografia usa Lato para textos, preços, botões e títulos principais, com peso 900 nos destaques; Roboto Slab 700 dá o acabamento dos títulos dos cartões. Todas as fontes são locais.

- **Básico:** R$ 17,90, biblioteca de um instrumento.
- **Completo:** R$ 27,90, bibliotecas dos seis instrumentos e repertórios por ocasião.
- Valores configurados conforme a orientação do usuário; não foram adicionados descontos, parcelamento, urgência ou garantias fictícias.
- Sem `checkoutUrl`, os botões informam que as vendas ainda não estão abertas.
- O fluxo planejado de entrega é: compra confirmada, liberação do acesso e orientações por e-mail.

## Estrutura

```text
public/audio/                 Estudos originais em WAV
public/images/                Mockup dos materiais e imagens da marca
src/components/
  HeroSection.tsx             Oferta, preço inicial e CTA
  AudioComparison.tsx         Duas versões do estudo de demonstração
  AudioPlayer.tsx             Play, pause, progresso e duração
  MaterialsSection.tsx        Material, entrega e prévia expansível
  LibraryPreview.tsx          Pastas, busca, filtros e favoritos locais
  LibraryFiles.tsx            Lista/grade e painel do arquivo
  Score.tsx                   Partitura SVG ilustrativa
  PricingSection.tsx          Básico e Completo
  ClosingSections.tsx         FAQ curto e rodapé
  InfoDialog.tsx              Informações de planos e documentos
  ScrollProgress.tsx          Progresso da rolagem
  ui.tsx                      Componentes visuais reutilizáveis
src/data/content.ts           Instrumentos, estudos e planos
src/data/library.ts           Arquivos de exemplo
src/data/sales.ts             Quatro dúvidas essenciais
src/styles/                   Biblioteca, planos e página de venda
src/index.css                 Base visual e responsividade
src/test/                     Testes das interações
scripts/generate-demo-audio.mjs
```

## Conteúdo e próximas integrações

Altere preços, benefícios e URLs de checkout em `src/data/content.ts`. `AudioPlayer` aceita arquivos reais por `src`; o catálogo usa os contratos de `src/types.ts`.

A prévia tem pastas por instrumento, subpastas de partituras/áudios, busca, filtros, ordenação, lista/grade e favoritos em memória. A organização lembra um gerenciador de documentos; não há conexão com o Google Drive. As partituras são ilustrativas, e os áudios são estudos originais sintetizados, compartilhados entre os instrumentos para demonstrar a navegação.

Esta entrega é somente frontend. Backend, catálogo comercial, PDFs completos, pagamentos, confirmação da compra, e-mail, contas e armazenamento em nuvem serão integrados na próxima fase. Consulte [as integrações futuras](docs/next-phase.md) e [a origem dos materiais](docs/assets.md).

## Publicação e validação

O build em `dist/` é estático e destinado à raiz do domínio. Configure `VITE_PUBLIC_SITE_URL` a partir de `.env.example` para canonical e Open Graph absolutos. Não foi implantada hospedagem nesta etapa.

O projeto utiliza Vite, React, TypeScript estrito, Tailwind, Lucide e Motion. Build, seis testes de interação e resposta HTTP do servidor local foram verificados. JSDOM usa mídia simulada; a revisão de layout e reprodução audível em navegador real permanece pendente.
