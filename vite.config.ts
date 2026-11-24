import { readFileSync } from 'node:fs'
import { basename } from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv, type Connect, type HtmlTagDescriptor } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { homeSearchDescription } from './src/data/sales.ts'
import { publicEnv } from './src/lib/public-env.ts'
import { transformSiteMessages } from './scripts/site-language.mjs'

const { redirects, rewrites } = JSON.parse(
  readFileSync(new URL('./vercel.json', import.meta.url), 'utf8'),
) as {
  redirects: { source: string; destination: string; permanent: boolean }[]
  rewrites: { source: string; destination: string }[]
}

const songPath = /^\/partituras-para-violino\/[a-z0-9-]+$/
const catalogPath = '/partituras-para-violino'
const englishCatalogPath = '/violin-sheet-music'
type ScorePageMarkup = { head: string; body: string; lang: string }
const englishPaths: Record<string, string> = {
  '/': '/en',
  '/biblioteca': '/en/biblioteca',
  '/partituras-para-violino': englishCatalogPath,
  '/repertorio-para-violino': '/en/repertorio-para-violino',
  '/partituras-guiadas-para-violino': '/en/partituras-guiadas-para-violino',
}

// Mirror the exact Vercel paths during development and local preview.
const routeHtml: Connect.NextHandleFunction = (request, response, next) => {
  if (request.method !== 'GET' && request.method !== 'HEAD') return next()
  const url = request.url ?? '/'
  const pathname = url.split('?', 1)[0]
  const suffix = url.slice(pathname.length)
  const redirect = redirects.find(({ source }) => source === pathname)
  if (redirect) {
    response.statusCode = redirect.permanent ? 308 : 307
    response.setHeader('Location', redirect.destination + suffix)
    response.end()
    return
  }
  const rewrite = rewrites.find(({ source }) => source === pathname)
  if (rewrite) request.url = rewrite.destination + suffix
  else if (/^\/en\/checkout\/(success|pending|failure)$/.test(pathname))
    request.url = `/en/app.html${suffix}`
  else if (pathname.startsWith('/en') && songPath.test(pathname.slice(3)))
    request.url = `${pathname}.html${suffix}`
  else if (songPath.test(pathname)) request.url = `${pathname}.html${suffix}`
  next()
}

export default defineConfig(({ mode, isSsrBuild }) => {
  const english = mode === 'english'
  const publicSettings = loadEnv(english ? 'production' : mode, process.cwd(), 'VITE_')
  const messages = english
    ? (JSON.parse(
        readFileSync(new URL('./src/data/site-en.json', import.meta.url), 'utf8'),
      ) as Record<string, string>)
    : {}
  const connectionOrigins = [
    ...new Set(
      [publicSettings.VITE_API_URL, publicSettings.VITE_SUPABASE_URL].flatMap((value) => {
        try {
          const url = new URL(publicEnv(value))
          return ['https:', 'http:'].includes(url.protocol) ? [url.origin] : []
        } catch {
          return []
        }
      }),
    ),
  ]
  return {
    base: english && !isSsrBuild ? '/en/' : '/',
    appType: 'mpa',
    build: isSsrBuild
      ? undefined
      : {
          rolldownOptions: {
            input: english
              ? ['index.html', 'app.html']
              : [
                  'index.html',
                  'app.html',
                  'repertorio-para-violino.html',
                  'partituras-guiadas-para-violino.html',
                  'partituras-para-violino.html',
                ],
          },
        },
    server: { proxy: { '/api': 'http://127.0.0.1:3001' } },
    plugins: [
      english && {
        name: 'music-library-english-messages',
        enforce: 'pre',
        transform(code, id) {
          const path = id.replaceAll('\\', '/').split('?')[0]
          if (!/\/(src|shared)\/(?!test\/).+\.tsx?$/.test(path) || path.includes('/node_modules/'))
            return
          if (
            /\/(score-pages\.tsx?|public-repertoire\.ts|guided-scores\.ts|site-language\.ts)$/.test(
              path,
            )
          )
            return
          return transformSiteMessages(code, path, (message, kind) => {
            if (kind === 'attribute' && message.startsWith('/')) {
              const [destination, fragment] = message.split('#', 2)
              const localized = englishPaths[destination]
              if (localized) return fragment === undefined ? localized : `${localized}#${fragment}`
            }
            return Object.hasOwn(messages, message) ? messages[message] : undefined
          })
        },
      },
      react(),
      tailwindcss(),
      {
        name: 'music-library-html',
        configureServer(server) {
          server.middlewares.use(async (request, response, next) => {
            if (request.method !== 'GET' && request.method !== 'HEAD') return next()
            const pathname = (request.url ?? '/').split('?', 1)[0].replace(/\.html$/, '')
            if (![catalogPath, englishCatalogPath].includes(pathname) && !songPath.test(pathname)) {
              return next()
            }

            try {
              const { fillScorePage, renderScorePage } = (await server.ssrLoadModule(
                '/src/score-pages.tsx',
              )) as {
                renderScorePage: (path: string) => ScorePageMarkup | undefined
                fillScorePage: (template: string, page: ScorePageMarkup) => string
              }
              const page = renderScorePage(pathname)
              if (!page) return next()

              const template = readFileSync(
                new URL('./partituras-para-violino.html', import.meta.url),
                'utf8',
              )
              const html = await server.transformIndexHtml(pathname, fillScorePage(template, page))
              response.setHeader('Content-Type', 'text/html; charset=utf-8')
              response.end(request.method === 'HEAD' ? undefined : html)
            } catch (error) {
              next(error)
            }
          })
          server.middlewares.use(routeHtml)
        },
        configurePreviewServer(server) {
          server.middlewares.use(routeHtml)
        },
        transformIndexHtml(_html, { filename }): HtmlTagDescriptor[] {
          const page = basename(filename)
          if (!['index.html', 'app.html'].includes(page)) return []
          const tags: HtmlTagDescriptor[] = connectionOrigins.map((origin) => ({
            tag: 'link',
            attrs: { rel: 'preconnect', href: origin, crossorigin: '' },
            injectTo: 'head',
          }))
          if (page === 'index.html') {
            tags.push(
              { tag: 'meta', attrs: { name: 'description', content: homeSearchDescription } },
              {
                tag: 'meta',
                attrs: { property: 'og:description', content: homeSearchDescription },
              },
              {
                tag: 'meta',
                attrs: { name: 'twitter:description', content: homeSearchDescription },
              },
            )
          }
          return tags
        },
      },
    ],
  }
})
