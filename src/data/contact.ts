// Public support address already configured for the platform's purchase emails.
export const supportEmail = 'suporte.partiturasebases@gmail.com'
export const supportInstagram = {
  handle: '@partiturasebases',
  url: 'https://www.instagram.com/partiturasebases/',
} as const

export function supportMailto(message = '') {
  return `mailto:${supportEmail}?subject=${encodeURIComponent('Dúvida sobre a Music Library')}&body=${encodeURIComponent(message.trim())}`
}
