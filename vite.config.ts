import { readFileSync } from 'node:fs'
import { basename } from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv, type Connect, type HtmlTagDescriptor } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { homeSearchDescription } from './src/data/sales.ts'
import { publicEnv } from './src/lib/public-env.ts'

const { redirects, rewrites } = JSON.parse(
  readFileSync(new URL('./vercel.json', import.meta.url), 'utf8'),
) as {
  redirects: { source: string; destination: string; permanent: boolean }[]
  rewrites: { source: string; destination: string }[]
}

const songPath = /^\/partituras-para-violino\/[a-z0-9-]+$/
const catalogPath = '/partituras-para-violino'
type ScorePageMarkup = { head: string; body: string }

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
  else if (songPath.test(pathname)) request.url = `${pathname}.html${suffix}`
  next()
}

export default defineConfig(({ mode, isSsrBuild }) => {
  const publicSettings = loadEnv(mode, process.cwd(), 'VITE_')
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
    appType: 'mpa',
    build: isSsrBuild
      ? undefined
      : {
          rolldownOptions: {
            input: [
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
      react(),
      tailwindcss(),
      {
        name: 'music-library-html',
        configureServer(server) {
          server.middlewares.use(async (request, response, next) => {
            if (request.method !== 'GET' && request.method !== 'HEAD') return next()
            const pathname = (request.url ?? '/').split('?', 1)[0].replace(/\.html$/, '')
            if (pathname !== catalogPath && !songPath.test(pathname)) return next()

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
