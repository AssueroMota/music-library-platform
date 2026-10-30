import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv, type HtmlTagDescriptor } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { publicEnv } from './src/lib/public-env.ts'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const publicSettings = loadEnv(mode, process.cwd(), 'VITE_')
  const configuredUrl = publicEnv(publicSettings.VITE_PUBLIC_SITE_URL)
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
  let siteUrl: string | undefined
  if (configuredUrl) {
    const parsed = new URL(configuredUrl)
    if (!['https:', 'http:'].includes(parsed.protocol))
      throw new Error('VITE_PUBLIC_SITE_URL precisa ser uma URL HTTP(S).')
    siteUrl = parsed.origin
  }
  return {
    server: { proxy: { '/api': 'http://127.0.0.1:3001' } },
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'music-library-seo',
        transformIndexHtml(html) {
          const tags: HtmlTagDescriptor[] = connectionOrigins.map((origin) => ({
            tag: 'link',
            attrs: { rel: 'preconnect', href: origin, crossorigin: '' },
            injectTo: 'head',
          }))
          if (siteUrl)
            tags.push(
              { tag: 'link', attrs: { rel: 'canonical', href: `${siteUrl}/` }, injectTo: 'head' },
              {
                tag: 'meta',
                attrs: { property: 'og:url', content: `${siteUrl}/` },
                injectTo: 'head',
              },
            )
          return {
            html: siteUrl
              ? html.replace(
                  'content="/images/violin-cover.jpg"',
                  `content="${siteUrl}/images/violin-cover.jpg"`,
                )
              : html,
            tags,
          }
        },
      },
    ],
  }
})
