import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const configuredUrl = loadEnv(mode, process.cwd(), 'VITE_').VITE_PUBLIC_SITE_URL
  let siteUrl: string | undefined
  if (configuredUrl) {
    const parsed = new URL(configuredUrl)
    if (!['https:', 'http:'].includes(parsed.protocol))
      throw new Error('VITE_PUBLIC_SITE_URL precisa ser uma URL HTTP(S).')
    siteUrl = parsed.origin
  }
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'music-library-seo',
        transformIndexHtml(html) {
          if (!siteUrl) return html
          return {
            html: html.replace(
              'content="/images/og-cover.jpg"',
              `content="${siteUrl}/images/og-cover.jpg"`,
            ),
            tags: [
              { tag: 'link', attrs: { rel: 'canonical', href: `${siteUrl}/` }, injectTo: 'head' },
              {
                tag: 'meta',
                attrs: { property: 'og:url', content: `${siteUrl}/` },
                injectTo: 'head',
              },
            ],
          }
        },
      },
    ],
  }
})
