import { mkdir, mkdtemp, readFile, realpath, rm, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { build } from 'vite'

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
  const { renderHome } = await import(pathToFileURL(join(renderDirectory, 'entry-prerender.js')))
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
} finally {
  if (dirname(await realpath(renderDirectory)) === cacheDirectory)
    await rm(renderDirectory, { recursive: true, force: true })
}
