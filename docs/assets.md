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

`Primeira luz` e `Passo sereno` são pequenos estudos originais usados na prévia de organização da biblioteca, sem amostras de gravações, fonogramas comerciais ou músicas de terceiros. Os timbres são sintetizados e não imitam gravações reais dos seis instrumentos. A demonstração principal da página usa atualmente os arquivos de A Thousand Years fornecidos pelo usuário, descritos abaixo.

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

## Página de violino — outubro de 2026

A página pública apresenta somente violino. A fotografia editorial `public/images/violinist.jpg` veio do Unsplash: https://images.unsplash.com/photo-1707109655792-60e05f7a445a (localizada em https://unsplash.com/s/photos/violin-player). Não representa uma compradora, uma professora da plataforma ou uma recomendação do produto. O arquivo é servido localmente. `public/images/violin-cover.jpg` é a composição Open Graph com essa foto e tipografia, em 1200 × 630.

O vídeo e os depoimentos são configurados em `src/data/violin-sales.ts`:

- `violinPresentation.videoSrc`: caminho do vídeo de apresentação (por exemplo `/videos/apresentacao.mp4`). Enquanto for `null`, aparece a reserva “Em breve”, sem botão de reprodução funcional.
- `violinTestimonials`: lista de relatos reais autorizados. Cada item recebe `name`, `context`, `quote`, `photo` e `photoAlt`. A lista vazia mostra a galeria editorial `violinMoments`, com fotos de violinistas e os créditos, sem nomes de compradores, estrelas ou relatos fictícios.

Os mockups antigos com vários instrumentos continuam arquivados, mas não são utilizados na página de vendas atual.

### Fotos editoriais adicionais

- `public/images/violin-performance.jpg`: cottonbro studio, Pexels, https://www.pexels.com/photo/person-playing-violin-7097474/ .
- `public/images/violin-ensemble.jpg`: cottonbro studio, Pexels, https://www.pexels.com/photo/a-person-playing-a-violin-7095719/ .

Essas fotografias ilustram momentos de estudo e interpretação. A seção identifica sua natureza editorial e os créditos. Não são apresentadas como fotos de compradores nem acompanhadas de relatos fictícios. Quando os depoimentos reais forem cadastrados em `violinTestimonials`, a seção exibe os relatos no lugar da galeria editorial.

### Campanha para apresentações

- `public/images/violin-event.jpg`: Luis Morales Torres, https://www.pexels.com/photo/elegant-violinist-performing-at-outdoor-event-32799703/ . Usada na abertura e na ocasião de celebrações; não representa comprador ou fundador.
- `public/images/violin-restaurant.jpg`: Khanh Hoang Minh 2, https://www.pexels.com/photo/man-playing-the-violin-in-a-restaurant-18512334/ . Mostra um violinista com pessoas em ambiente de restaurante.
- `public/images/violin-performance.jpg`: cottonbro studio, origem já registrada acima. Utilizada na ocasião de apresentações e como pôster do vídeo reservado.
- `public/images/violin-cover.jpg`: capa de compartilhamento atualizada para a campanha preta, laranja e âmbar, composta com a foto de apresentação de Luis Morales Torres.

A informação de 25 anos de experiência musical foi fornecida e confirmada pelo usuário. Nenhuma das fotos editoriais é apresentada como retrato do responsável pelo material. O cartão de autoridade usa tipografia e o número de anos, sem retrato substituto.

### Troca de imagens e simplificação de textos

A pedido do usuário, as fotos dos cartões de restaurantes e eventos foram substituídas:

- `public/images/violin-dining.jpg`: Los Muertos Crew, https://www.pexels.com/photo/man-playing-violin-7772329/ . Violinista tocando em restaurante; utilizada no cartão Restaurantes.
- `public/images/violin-stage.jpg`: Daniel Ponomarev, https://www.pexels.com/photo/a-musician-playing-the-violin-4898305/ . Violinista em apresentação com microfone e luzes coloridas; utilizada no cartão Eventos & apresentações.

Os créditos visíveis da galeria foram atualizados. As fotografias anteriores continuam arquivadas e o pôster do vídeo não foi alterado. Foram retirados os textos sobrepostos à foto principal, a chamada acima do título principal, a chamada e a nota lateral acima da galeria. A seção visual dos 25 anos foi retirada da página; o dado informado permanece no arquivo de configuração para referência.

### Demonstração principal — A Thousand Years

- `public/scores/a-thousand-years.png`: cópia sem alteração da imagem `A Thousand Years.png`, fornecida pelo usuário na pasta `Desktop/Partituras RESTAURANTE/2 - Românticas Leves - Atuais/A Thousand Years/`. Dimensões: 658 × 897. A imagem mostra clave de Sol, armadura com dois bemóis, compasso 12/8 e marcação de semínima pontuada = 46. É exibida integralmente com opção de abrir ampliada, sem redesenhar a notação.
- `public/audio/a-thousand-years.mp3`: cópia sem alteração do MP3 fornecido em `Desktop/A Thousand Years.mp3`. O usuário confirmou que contém somente o acompanhamento. Não foi criada nem anunciada uma versão com melodia.
- `src/data/demonstration.ts`: centraliza título, artista, arquivos e dados de leitura. Os mesmos dados são usados na demonstração principal e na imagem de apresentação do material.
- O material é identificado como A Thousand Years / Christina Perri. Os estudos sintéticos permanecem apenas na prévia de navegação da biblioteca e não são apresentados como áudio dessa música.
- Os arquivos de origem, as cópias em `public` e as cópias do build foram comparados por SHA-256 e são idênticos. A inclusão local não registra uma licença ou comprovação de direitos que não tenha sido fornecida.

### Playlist da visita

Quatro MP3s fornecidos pelo usuário em `Desktop/Partituras RESTAURANTE/5 - Temáticas  Filme  Instrumental - PENDENTE/` foram copiados sem alteração e verificados por SHA-256:

- `public/audio/a-whole-new-world.mp3`: `1 - A Whole New World - Aladdin -D-121bpm-441hz.mp3`.
- `public/audio/beauty-and-the-beast.mp3`: `2 - Beauty And The Beast-D-67bpm-441hz.mp3`.
- `public/audio/experience.mp3`: `3 - Experience - Ludovico-Fm-92bpm-441hz.mp3`.
- `public/audio/dance-monkey.mp3`: `4 - Dance Monkey-Fm-98bpm-442hz.mp3`.

`src/data/visit-playlist.ts` define a ordem da playlist. `VisitPlaylist` aparece somente na página pública de vendas e tenta iniciar a primeira faixa a 20% do volume. Se o navegador exigir interação, o visitante usa o play visível. Há seleção de faixa, anterior, próxima, pausa e volume; ao terminar a última, a lista retorna à primeira. A pausa manual é respeitada ao retornar à página na mesma sessão. A trilha pausa quando outro áudio ou vídeo da página começa; não retoma sozinha após a demonstração. Os arquivos públicos são a trilha da visita, sem alterar as permissões dos materiais pagos.

### Tipografia e leitura

A interface utiliza Inter Variable, distribuída pelo pacote `@fontsource-variable/inter` e servida pelo próprio site. A importação segue a [documentação do Fontsource](https://fontsource.org/docs/getting-started/variable). Os títulos das partituras de demonstração preservam sua composição musical.

`src/styles/typography.css` reúne a escala de leitura da página de vendas: textos principais entre 16 e 18 px, benefícios dos planos em 16 px, ações entre 14 e 16 px e legendas entre 12 e 14 px. Há ajustes de contraste, espaçamento e quebra de linhas para cabeçalho, demonstração, planos, FAQ, checkout e playlist. A revisão em Chromium verificou o carregamento da fonte e a ausência de rolagem horizontal em larguras de 320, 390, 768 e 1440 px.

### Nova foto de Eventos & apresentações

A pedido do usuário, a imagem de Daniel Ponomarev foi substituída por uma fotografia de concerto de Roxanne Minnish: [Handsome Man Wearing Black Suit Playing Violin / Pexels](https://www.pexels.com/photo/handsome-man-wearing-black-suit-playing-violin-4750593/). O arquivo `public/images/violin-live-performance.jpg` foi obtido em `https://images.pexels.com/photos/4750593/pexels-photo-4750593.jpeg?auto=compress&cs=tinysrgb&w=1000` e mostra um violinista de traje formal com outros músicos. A mesma foto foi aplicada ao mockup do Plano Completo para manter a apresentação consistente. O enquadramento do cartão preserva o rosto e o instrumento, e os créditos visíveis foram atualizados. A foto é ilustrativa e não representa um comprador ou responsável pela plataforma.

Essa opção também foi substituída a pedido do usuário. A foto atual é [Elegant Female Violinist with Passionate Pose / Pexels](https://www.pexels.com/photo/elegant-female-violinist-with-passionate-pose-30563416/), de Daniel Dolidze, salva em `public/images/violin-portrait.jpg`. Origem: `https://images.pexels.com/photos/30563416/pexels-photo-30563416.jpeg?auto=compress&cs=tinysrgb&w=1000`. Mostra uma violinista de roupa preta, em retrato com fundo neutro. Está no cartão de eventos e no mockup do Completo, com texto alternativo e crédito correspondentes. É uma imagem ilustrativa, sem alegação de ser compradora ou de retratar uma apresentação real da plataforma.

### Novas faixas no início da playlist

O usuário forneceu mais três MP3s na pasta `Desktop/Partituras RESTAURANTE/6 - Animadas  Final - PENDENTE/`. As cópias foram comparadas com os originais por SHA-256:

1. `public/audio/get-lucky.mp3`: `1 - Get Lucky.mp3`.
2. `public/audio/marry-you.mp3`: `2 - Marry You-F-145bpm-440hz.mp3`.
3. `public/audio/happy.mp3`: `3 - Happy (Video).mp3`.

Essas são as três primeiras faixas, nessa ordem. Depois vêm A Whole New World, Beauty and the Beast, Experience e Dance Monkey. A lista contém sete faixas e começa em Get Lucky, respeitando a pausa manual e as restrições de reprodução automática do navegador.

### Balão de contato

`ContactBubble` fica no canto inferior direito da página de vendas. Usa `suporte.partiturasebases@gmail.com`, o endereço já configurado em `SUPPORT_EMAIL` e autorizado pelo usuário para o balão. `src/data/contact.ts` centraliza o endereço público e a montagem do link `mailto:` com a dúvida codificada. O botão abre o aplicativo de e-mail para o visitante concluir o envio; não afirma que a mensagem foi enviada pelo site. O rodapé abre o mesmo painel. No celular, os controles da playlist reservam espaço para o balão; enquanto o painel de contato está aberto, a playlist fica visualmente recolhida para não cobrir o formulário.

### Foto de apresentação vista pela frente

Para atender à preferência por uma pessoa vista pela frente no palco, o retrato de estúdio foi substituído por [Woman Playing Violin on Stage](https://www.pexels.com/photo/woman-playing-violin-on-stage-7095516/), de cottonbro studio / Pexels. A fotografia mostra uma violinista durante a execução, vista pela frente em leve ângulo, com estantes e cenário de palco visíveis. Arquivo: `public/images/violin-concert-front.jpg`; origem: `https://images.pexels.com/photos/7095516/pexels-photo-7095516.jpeg?auto=compress&cs=tinysrgb&w=1200`. Foi aplicada no cartão de eventos e na composição do Plano Completo, com os créditos e o texto alternativo atualizados. O corte é feito por CSS, sem alterar o arquivo da fotografia. A imagem é ilustrativa.
