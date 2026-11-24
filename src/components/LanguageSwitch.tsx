import { englishSite, languageUrl } from '../lib/site-language'

export function LanguageSwitch({ path = '/', suffix = '' }: { path?: string; suffix?: string }) {
  return (
    <a
      className="language-switch"
      href={languageUrl(path, !englishSite) + suffix}
      lang={englishSite ? 'pt-BR' : 'en'}
      hrefLang={englishSite ? 'pt-BR' : 'en'}
      aria-label={englishSite ? 'Português (Brasil)' : 'English'}
    >
      {englishSite ? 'PT-BR' : 'English'}
    </a>
  )
}
