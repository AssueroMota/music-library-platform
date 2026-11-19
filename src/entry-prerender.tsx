import { renderToString } from 'react-dom/server'
import { HomePage } from './HomePage'

export function renderHome(renderedAt: number) {
  // React emits image preload hints before the rendered tree.
  const html = renderToString(<HomePage renderedAt={renderedAt} />)
  const preloads = html.match(/^(?:<link\b[^>]+>)+/)?.[0] ?? ''
  return { markup: html.slice(preloads.length), preloads }
}
