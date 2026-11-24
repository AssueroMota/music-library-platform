import { mkdir, mkdtemp, readFile, realpath, rm, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { JSDOM } from 'jsdom'
import { build } from 'vite'

const origin = 'https://www.partiturasebases.com.br'
const catalogPath = '/partituras-para-violino'
const guides = ['/repertorio-para-violino', '/partituras-guiadas-para-violino']
const messages = JSON.parse(await readFile('src/data/site-en.json', 'utf8'))

function translate(text) {
  const key = text.trim().replace(/\s+/g, ' ')
  if (!Object.hasOwn(messages, key)) return text
  return text.match(/^\s*/)[0] + messages[key] + text.match(/\s*$/)[0]
}

function addAlternateLinks(doc, path) {
  for (const [language, url] of [
    ['pt-BR', path],
    ['en', '/en' + path],
  ]) {
    const link = doc.createElement('link')
    link.rel = 'alternate'
    link.hreflang = language
    link.href = origin + url
    doc.head.append(link)
  }
}

function englishLink(href) {
  const [path, hash] = href.split('#', 2)
  const localized =
    path === catalogPath
      ? '/violin-sheet-music'
      : path === '/'
        ? '/en'
        : path === '/biblioteca' || guides.includes(path) || path.startsWith(catalogPath + '/')
          ? `/en${path}`
          : path
  return hash === undefined ? localized : `${localized}#${hash}`
}

async function localizeEditorialPage(path) {
  const portuguesePath = `dist${path}.html`
  const original = await readFile(portuguesePath, 'utf8')
  const doc = new JSDOM(original).window.document
  addAlternateLinks(doc, path)
  const header = doc.querySelector('.guide-header .wrap')
  const switcher = doc.createElement('a')
  switcher.href = '/en' + path
  switcher.lang = 'en'
  switcher.hreflang = 'en'
  switcher.textContent = 'English'
  header.append(switcher)
  const serialize = () => '<!doctype html>\n' + doc.documentElement.outerHTML
  await writeFile(portuguesePath, serialize())

  doc.documentElement.lang = 'en'
  const isSong = path.startsWith(catalogPath + '/')
  const title = (value) =>
    isSong
      ? value.replace(/partitura (guiada )?para violino( com playback)?/i, (_, guided, playback) =>
          guided
            ? 'violin play-along score video'
            : playback
              ? 'violin sheet music with backing track'
              : 'violin sheet music',
        )
      : translate(value)
  doc.title = title(doc.title)

  const walker = doc.createTreeWalker(doc.body, 4)
  for (let node; (node = walker.nextNode());) {
    const parent = node.parentElement
    if (!parent || parent.closest('script, style, cite')) continue
    if (parent.closest('.score-list h3, [aria-current="page"]') && isSong) continue
    if (parent.closest('.score-artist')) {
      node.textContent = node.textContent.split(' · ').map(translate).join(' · ')
      continue
    }
    if (parent.closest('h1')) node.textContent = title(node.textContent)
    else node.textContent = translate(node.textContent)
  }
  for (const anchor of doc.querySelectorAll('a[href^="/"]'))
    anchor.setAttribute('href', englishLink(anchor.getAttribute('href')))
  switcher.href = path
  switcher.lang = 'pt-BR'
  switcher.hreflang = 'pt-BR'
  switcher.textContent = 'Português (Brasil)'
  for (const attr of ['aria-label', 'alt']) {
    for (const element of doc.querySelectorAll(`[${attr}]`))
      element.setAttribute(attr, translate(element.getAttribute(attr)))
  }
  doc.querySelector('link[rel=canonical]').href = origin + '/en' + path
  for (const meta of doc.querySelectorAll('meta[name=description], meta[property^="og:"]')) {
    const property = meta.getAttribute('property')
    if (property === 'og:url') meta.content = origin + '/en' + path
    else if (property === 'og:title') meta.content = doc.title
    else if (property === 'og:locale') meta.content = 'en_US'
    else if (property === 'og:description' || !property) meta.content = translate(meta.content)
  }
  const schema = doc.querySelector('script[type="application/ld+json"]')
  const breadcrumbs = JSON.parse(schema.textContent)
  for (const item of breadcrumbs.itemListElement) {
    const url = new URL(item.item)
    item.item = origin + englishLink(url.pathname)
    if (!(isSong && url.pathname === path)) item.name = translate(item.name)
  }
  schema.textContent = JSON.stringify(breadcrumbs).replaceAll('<', '\\u003c')
  await writeFile(`dist/en${path}.html`, serialize())
  doc.defaultView.close()
}

const cache = resolve('node_modules/.cache')
await mkdir(cache, { recursive: true })
const cacheDirectory = await realpath(cache)
const renderDirectory = await mkdtemp(join(cacheDirectory, 'music-library-render-'))

try {
  await build({
    build: {
      ssr: 'src/entry-prerender.tsx',
      outDir: renderDirectory,
      copyPublicDir: false,
      emptyOutDir: false,
    },
  })
  const { renderHome, renderScorePages, fillScorePage } = await import(
    pathToFileURL(join(renderDirectory, 'entry-prerender.js'))
  )
  const renderedAt = Date.now()
  const { markup, preloads } = renderHome(renderedAt)

  await build()
  const output = 'dist/index.html'
  const shell = await readFile(output, 'utf8')
  const root = '<div id="root"></div>'
  if (!shell.includes(root)) throw new Error('Missing homepage root in the Vite output.')
  const html = shell
    .replace(root, () => `<div id="root" data-rendered-at="${renderedAt}">${markup}</div>`)
    .replace('</head>', () => `${preloads}\n  </head>`)
  await writeFile(output, html)

  const englishRenderDirectory = join(renderDirectory, 'en')
  await build({
    mode: 'english',
    build: {
      ssr: 'src/entry-prerender.tsx',
      outDir: englishRenderDirectory,
      copyPublicDir: false,
      emptyOutDir: false,
    },
  })
  const englishEntry = await import(
    pathToFileURL(join(englishRenderDirectory, 'entry-prerender.js'))
  )
  const englishHome = englishEntry.renderHome(renderedAt)
  await build({
    mode: 'english',
    build: { outDir: 'dist/en', copyPublicDir: false, emptyOutDir: false },
  })

  const homeLanguages = [
    ['pt-BR', origin + '/'],
    ['en', origin + '/en'],
  ]
  const alternateLinks = homeLanguages
    .map(([language, url]) => `<link rel="alternate" hreflang="${language}" href="${url}">`)
    .join('\n')
  await writeFile(
    output,
    html.replace('</head>', () => `${alternateLinks}\n</head>`),
  )

  const englishTitle = 'Music Library | Violin Sheet Music and Play-Along Videos'
  const englishDescription =
    'Find violin sheet music by song and practice with backing tracks or follow-along score videos. Try the free A Thousand Years sample.'
  const englishShell = await readFile('dist/en/index.html', 'utf8')
  const englishDocument = new JSDOM(englishShell).window.document
  englishDocument.documentElement.lang = 'en'
  englishDocument.title = englishTitle
  for (const attribute of ['name', 'property']) {
    for (const meta of englishDocument.querySelectorAll(`meta[${attribute}]`)) {
      const name = meta.getAttribute(attribute)
      if (/^(?:og:|twitter:)?description$/.test(name)) meta.content = englishDescription
      if (/^(?:og:|twitter:)title$/.test(name)) meta.content = englishTitle
      if (/^(?:og:|twitter:)image:alt$/.test(name))
        meta.content = 'Music Library violin sheet music and backing tracks'
      if (name === 'og:locale') meta.content = 'en_US'
      if (name === 'og:url') meta.content = origin + '/en'
    }
  }
  englishDocument.querySelector('link[rel=canonical]').href = origin + '/en'
  const noScript = englishDocument.querySelector('noscript')
  noScript.textContent =
    'Enable JavaScript to play audio, use the interactive demo, or select a plan.'
  const schema = englishDocument.querySelector('script[type="application/ld+json"]')
  const graph = JSON.parse(schema.textContent)
  const website = graph['@graph'].find((node) => node['@type'] === 'WebSite')
  website['@id'] = origin + '/en#website'
  website.inLanguage = 'en'
  website.url = origin + '/en'
  schema.textContent = JSON.stringify(graph)
  const englishHtml = '<!doctype html>\n' + englishDocument.documentElement.outerHTML
  englishDocument.defaultView.close()
  await writeFile(
    'dist/en/index.html',
    englishHtml
      .replace(
        root,
        () => `<div id="root" data-rendered-at="${renderedAt}">${englishHome.markup}</div>`,
      )
      .replaceAll('/en/favicon.png', '/favicon.png')
      .replace('</head>', () => `${englishHome.preloads}${alternateLinks}\n</head>`),
  )
  const englishApp = (await readFile('dist/en/app.html', 'utf8'))
    .replace('lang="pt-BR"', 'lang="en"')
    .replaceAll('/en/favicon.png', '/favicon.png')
    .replace(
      'Ative o JavaScript para acessar sua biblioteca ou consultar seu pedido.',
      'Enable JavaScript to access your library or check your order.',
    )
  await writeFile('dist/en/app.html', englishApp)

  const scorePages = renderScorePages()
  const catalog = scorePages[0]
  const [scoreTemplate, sitemap] = await Promise.all([
    readFile(`dist${catalog.path}.html`, 'utf8'),
    readFile('dist/sitemap.xml', 'utf8'),
  ])
  const localizedEditorialPaths = [
    ...guides,
    ...scorePages.map(({ path }) => path).filter((path) => path.startsWith(catalogPath + '/')),
  ]
  const sitemapEntries = [
    ...scorePages.map(({ url }) => url),
    origin + '/en',
    ...localizedEditorialPaths.map((path) => origin + '/en' + path),
  ].map((url) => `  <url>\n    <loc>${url}</loc>\n  </url>`)
  await mkdir(`dist${catalog.path}`, { recursive: true })
  await Promise.all([
    ...scorePages.map((page) =>
      writeFile(`dist${page.path}.html`, fillScorePage(scoreTemplate, page)),
    ),
    writeFile(
      'dist/sitemap.xml',
      sitemap.replace('</urlset>', () => `${sitemapEntries.join('\n')}\n</urlset>`),
    ),
  ])
  await mkdir('dist/en' + catalogPath, { recursive: true })
  await Promise.all(localizedEditorialPaths.map(localizeEditorialPage))
} finally {
  if (dirname(await realpath(renderDirectory)) === cacheDirectory)
    await rm(renderDirectory, { recursive: true, force: true })
}
