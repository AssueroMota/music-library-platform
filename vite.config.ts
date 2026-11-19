import { readFileSync } from 'node:fs'
import { basename } from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv, type Connect, type HtmlTagDescriptor } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { publicEnv } from './src/lib/public-env.ts'

const { redirects, rewrites } = JSON.parse(
  readFileSync(new URL('./vercel.json', import.meta.url), 'utf8'),
) as {
  redirects: { source: string; destination: string; permanent: boolean }[]
  rewrites: { source: string; destination: string }[]
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
          server.middlewares.use(routeHtml)
        },
        configurePreviewServer(server) {
          server.middlewares.use(routeHtml)
        },
        transformIndexHtml(_html, { filename }): HtmlTagDescriptor[] {
          if (!['index.html', 'app.html'].includes(basename(filename))) return []
          return connectionOrigins.map((origin) => ({
            tag: 'link',
            attrs: { rel: 'preconnect', href: origin, crossorigin: '' },
            injectTo: 'head',
          }))
        },
      },
    ],
  }
})
