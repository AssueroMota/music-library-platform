import { normalizeSearch } from './lib/normalize-search'

const results = document.querySelector<HTMLElement>('[data-catalog-results]')
if (results) {
  const form = results.querySelector<HTMLFormElement>('form')!
  const input = form.querySelector<HTMLInputElement>('input[name="q"]')!
  const total = results.querySelector<HTMLElement>('[data-result-count]')!
  const empty = results.querySelector<HTMLElement>('[data-no-results]')!
  const alternate = document.querySelector<HTMLAnchorElement>('[data-catalog-language]')
  const alternateUrl = alternate ? new URL(alternate.href) : undefined
  const songs = Array.from(
    results.querySelectorAll<HTMLElement>('[data-song-search]'),
    (element) => {
      const link = element.querySelector<HTMLAnchorElement>('[data-song-checkout]')!
      return {
        element,
        link,
        url: new URL(link.href),
        text: normalizeSearch(element.dataset.songSearch ?? ''),
      }
    },
  )

  function updateFilter() {
    const query = input.value.trim()
    const words = normalizeSearch(query).split(/\s+/).filter(Boolean)
    let visible = 0
    for (const { element, link, url, text } of songs) {
      const matches = words.every((word) => text.includes(word))
      element.hidden = !matches
      if (!matches) continue
      visible++
      if (query) url.searchParams.set('q', query)
      else url.searchParams.delete('q')
      link.href = url.href
    }
    total.textContent = visible === 1 ? total.dataset.one! : `${visible} ${total.dataset.many}`
    empty.hidden = visible > 0
    if (alternate && alternateUrl) {
      if (query) alternateUrl.searchParams.set('q', query)
      else alternateUrl.searchParams.delete('q')
      alternate.href = alternateUrl.href
    }
    const url = new URL(window.location.href)
    if (query) url.searchParams.set('q', query)
    else url.searchParams.delete('q')
    if (url.href !== window.location.href) window.history.replaceState(null, '', url)
  }

  function readQuery() {
    input.value = (new URLSearchParams(window.location.search).get('q') ?? '').slice(
      0,
      input.maxLength,
    )
    updateFilter()
  }

  input.addEventListener('input', updateFilter)
  form.addEventListener('submit', (event) => {
    event.preventDefault()
    updateFilter()
  })
  window.addEventListener('pageshow', readQuery)
  window.addEventListener('popstate', readQuery)
  readQuery()
}
