# Origem dos materiais

## Imagens

- `public/images/instruments.jpg`: composição ilustrativa gerada com a ferramenta integrada Imagegen, usando a skill Imagegen. Um único atlas fotográfico de seis instrumentos, apresentado em recortes CSS. Não é fotografia do fundador nem de materiais do catálogo.
- `public/images/music-library-bundle.webp`: novo mockup autoral de livros, instrumentos, tablet e partituras, gerado com Imagegen e editado pela mesma ferramenta para remover o fundo. O WebP preserva a transparência, tem 1672 × 941 pixels e foi comprimido para aproximadamente 373 KB sem alterar a composição. Usado no hero, no bloco de materiais e no plano completo.
- `public/images/og-cover.jpg`: peça Open Graph montada localmente com os instrumentos e tipografia do sistema. O tamanho é 1200 × 630 pixels.
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

Lato (400, 700 e 900) e Roboto Slab (700) são servidas localmente pelos pacotes Fontsource. Lato é a fonte principal e Roboto Slab aparece nos títulos dos cartões de materiais e planos. Consulte as licenças OFL nos pacotes. Não há chamadas a servidores de fontes durante a navegação. Os ícones são do Lucide React, sob a licença do pacote.

## Prompt do novo mockup

Gerado com a ferramenta integrada Imagegen; a referência enviada pelo usuário orientou a linguagem de página de vendas, sem ser reproduzida na imagem.

> Use case: ads-marketing. Asset type: hero product bundle image for an original Brazilian musician digital sheet-music library called MUSIC LIBRARY. Create a premium photorealistic 3D digital music collection still-life, a coherent original composition, NOT a screenshot, not a website. Wide landscape composition. Center: two elegant substantial navy hardcover music folios with metallic gold edges, front folio cover text exactly 'MUSIC LIBRARY' and below 'PARTITURAS & REPERTÓRIOS', a tasteful minimal soundwave gold emblem, no other text. Surround the folios with finely detailed REALISTIC musical instruments: a golden alto saxophone in the foreground left, amber violin behind left, a classical acoustic guitar behind right, silver transverse flute across foreground, a cello on the right behind the book. In front an open sheet music book with plausible fine music notation, black studio headphones, and a small thin modern tablet angled in perspective showing an elegant dark music playlist with gold and green accents; no readable tablet UI text required. Dark navy blue #0B1627 studio background, subtly blending to the SAME navy color on all image edges so it integrates with a dark navy website section, no visible floor horizon. Warm golden rim lighting on wood and brass, sophisticated high-end product-ad photography, crisp detail, realistic proportions, natural perspective, very subtle soft shadows below. Generous 8% breathing space around the outer instruments, all objects fully contained. No people, no hands, no fake numbers or discount badges, no prices, no guarantees, no commercial artist names, no commercial song titles, no watermarks, no logos other than MUSIC LIBRARY text. Horizontal product image, not tall.

Prompt de edição para recorte transparente, também com a ferramenta integrada:

> Edit this exact product composition into a clean transparent-background cutout for use on both navy and off-white website sections. Remove ONLY the dark blue studio background and floor, including the dark spaces between the instruments. Keep every instrument, both music books with their exact cover lettering, open sheet music, headphones and tablet unchanged in position, proportions, colors, fine detail and framing. Keep the full arrangement and all object edges. Preserve realistic delicate contact shadows as soft alpha if possible. Output genuine transparency, no white fill, no checkerboard drawn into the image, no new elements, no new text. The objects are the edit target, their identity and arrangement must be preserved.
