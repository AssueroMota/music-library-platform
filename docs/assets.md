# Origem dos materiais

## Imagens

- `public/images/instruments.jpg`: composição ilustrativa gerada com a ferramenta integrada Imagegen, usando a skill Imagegen. Um único atlas fotográfico de seis instrumentos, apresentado em recortes CSS. Não é fotografia do fundador nem de materiais do catálogo.
- `public/images/og-cover.jpg`: peça Open Graph montada localmente com a composição acima e tipografia do sistema. O tamanho é 1200 × 630 pixels.
- `public/favicon.svg`: marca vetorial simples criada para este projeto.
- A foto do fundador permanece explicitamente reservada, sem retrato inventado.

Prompt final usado na ferramenta integrada:

> Use case: product-mockup. Create ONE photographic contact sheet asset for a premium musician library website. Landscape image exactly divided into 3 columns and 2 rows, six equally sized rectangular cells, no borders, no gaps, no text or labels. Each cell is a separate photorealistic fine instrument product photograph against the same very dark navy blue almost black studio backdrop, moody warm gold rim light, rich polished wood and metal, subtle vignette. Top row left: classical violin standing diagonally, full recognizable violin body and neck. Top row center: golden alto saxophone, curved bell clearly visible. Top row right: silver transverse concert flute placed diagonally, keys clearly visible. Bottom row left: classical nylon string acoustic guitar, full recognizable body and neck. Bottom row center: viola da arco, full recognizable larger viola body and neck, amber wood. Bottom row right: cello with recognizable full body, neck and endpin. Center each individual instrument within its own cell with ample 12 percent padding. Instruments must not cross cells. Elegant editorial product photography, clean and realistic musical instrument construction. No people, no hands, no brands, no logos, no sheet music, no graphics, no watermark. Designed to crop each of the six equally sized cells independently for website cards.

## Áudio e partitura

`Primeira luz` e `Passo sereno` são pequenos estudos originais criados para esta demonstração, sem amostras de gravações, fonogramas comerciais ou músicas de terceiros. Os timbres são sintetizados e não imitam gravações reais dos seis instrumentos.

O gerador determinístico está em `scripts/generate-demo-audio.mjs`. Para reproduzir os quatro arquivos WAV:

```sh
npm run assets:audio
```

- Formato: PCM mono, 16 bits, 22.050 Hz.
- Primeira luz: Dó maior, 80 BPM, 12,2 segundos.
- Passo sereno: Lá menor, 96 BPM, 10,2 segundos.
- Cada estudo tem acompanhamento e versão com melodia sobre o mesmo acompanhamento.
- A partitura SVG usa as mesmas notas da melodia, em altura de concerto e clave de Sol. É uma prévia ilustrativa. As seleções por instrumento reutilizam esses estudos para demonstrar a organização; não são arranjos transpostos ou adaptados à tessitura de cada instrumento.

## Fontes e ícones

Manrope Variable e Cormorant Garamond são servidas localmente por pacotes Fontsource. Consulte as licenças OFL nos respectivos pacotes. Não há chamadas a servidores de fontes durante a navegação. Os ícones são do Lucide React, sob a licença do pacote.
