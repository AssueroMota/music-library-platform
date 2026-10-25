// Public support address already configured for the platform's purchase emails.
export const supportEmail = 'suporte.partiturasebases@gmail.com'

export function supportMailto(message = '') {
  return `mailto:${supportEmail}?subject=${encodeURIComponent('Dúvida sobre a Music Library')}&body=${encodeURIComponent(message.trim())}`
}
