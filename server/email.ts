const escape = (text: string) =>
  text.replace(
    /[&<>"']/g,
    (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!,
  )

function withEnglish(
  email: { text: string; html: string },
  heading: string,
  description: string,
  link: string,
  support: string,
) {
  const englishLink = new URL(link)
  if (englishLink.pathname === '/biblioteca') englishLink.pathname = '/en/biblioteca'
  const note = 'Bookmark your personal link and keep it private.'
  const englishText = `${heading}\n\n${description}\n\nOpen my library: ${englishLink.href}\n\n${note}\nSupport: ${support}`
  const englishHtml = `<section lang="en" style="max-width:560px;margin:24px auto;padding:24px;color:#14263f;background:#fff;font-family:Arial,sans-serif"><h2>${escape(heading)}</h2><p>${escape(description)}</p><p><a href="${escape(englishLink.href)}">Open my library</a></p><p>${note}</p><p>Support: <a href="mailto:${escape(support)}">${escape(support)}</a></p></section>`
  return {
    text: `${email.text}\n\nEnglish\n\n${englishText}`,
    html: email.html.replace('</body>', () => `${englishHtml}</body>`),
  }
}

export function confirmationEmail(productName: string, link: string, support: string) {
  const email = {
    text: `Seu acesso à Music Library está pronto!\n\nCompra confirmada: ${productName}.\n\nSeu link pessoal da biblioteca: ${link}\n\nGuarde este endereço nos favoritos. Ele continua o mesmo nas próximas visitas e reúne os materiais liberados para sua conta. Não compartilhe seu link pessoal.\n\nSuporte: ${support}`,
    html: `<!doctype html><html lang="pt-BR"><body style="margin:0;background:#faf8f3;font-family:Arial,sans-serif;color:#14263f"><table role="presentation" style="width:100%;padding:32px 16px"><tr><td align="center"><table role="presentation" style="max-width:560px;width:100%;border:1px solid #e0e4e8;border-radius:12px;background:white"><tr><td style="padding:30px;background:#0b1627;color:#e7c66c;font-size:22px;font-weight:bold">music library.</td></tr><tr><td style="padding:32px"><h1 style="font-size:24px">Seu repertório começa aqui.</h1><p style="line-height:1.7">Sua compra foi confirmada e o acesso a <strong>${escape(productName)}</strong> já está disponível.</p><p style="line-height:1.7">Use seu link pessoal para entrar. Sua biblioteca reúne os materiais dos produtos que você adquiriu.</p><p style="margin:30px 0"><a href="${escape(link)}" style="display:inline-block;padding:16px 24px;border-radius:6px;background:#24c45d;color:#072812;font-weight:bold;text-decoration:none">Acessar minha biblioteca</a></p><p style="font-size:13px;line-height:1.7;color:#5f6b7b">Guarde este endereço nos favoritos. Seu link continua o mesmo nas próximas visitas. Não compartilhe seu link pessoal.</p><hr style="border:0;border-top:1px solid #e0e4e8;margin:24px 0"><p style="font-size:13px">Precisa de ajuda? <a href="mailto:${escape(support)}">${escape(support)}</a></p></td></tr></table></td></tr></table></body></html>`,
  }
  return withEnglish(
    email,
    'Your Music Library access is ready',
    'Your purchase was confirmed. Your library now includes the materials in your selected plan.',
    link,
    support,
  )
}

function portugueseLoginEmail(link: string, support: string) {
  return {
    text: `Seu link pessoal da Music Library: ${link}\n\nGuarde este endereço nos favoritos: ele continua o mesmo nas próximas visitas. O acesso mostra os materiais liberados para sua conta. Não compartilhe seu link pessoal.\n\nSe você não solicitou este acesso, ignore esta mensagem.\nSuporte: ${support}`,
    html: `<!doctype html><html lang="pt-BR"><body style="font-family:Arial,sans-serif;color:#14263f;background:#faf8f3;padding:24px"><main style="max-width:560px;margin:auto;background:#fff;padding:30px;border-radius:12px"><h1 style="font-size:24px">Sua biblioteca, sempre no mesmo endereço.</h1><p style="line-height:1.7">Use seu link pessoal para ouvir os áudios e abrir as partituras liberadas para sua conta.</p><p style="margin:28px 0"><a href="${escape(link)}" style="display:inline-block;padding:16px 24px;background:#24c45d;color:#072812;border-radius:6px;text-decoration:none;font-weight:bold">Acessar minha biblioteca</a></p><p style="font-size:13px;line-height:1.7">Guarde este endereço nos favoritos e não compartilhe seu link pessoal.</p><p style="font-size:13px">Se você não solicitou este acesso, ignore esta mensagem.</p><p style="font-size:13px">Suporte: <a href="mailto:${escape(support)}">${escape(support)}</a></p></main></body></html>`,
  }
}

export function loginEmail(link: string, support: string) {
  return withEnglish(
    portugueseLoginEmail(link, support),
    'Your personal Music Library link',
    'Use your personal link to open the sheet music and play the audio included in your account. If you did not request it, you can ignore this email.',
    link,
    support,
  )
}

export function freeAccessEmail(link: string, support: string) {
  const email = portugueseLoginEmail(link, support)
  const trial = {
    text: `Seu acesso grátis à Music Library está pronto!\n\nVocê tem 2 partituras com playback: A Thousand Years e Perfect; e 2 guiadas em vídeo: My Way e Bondade de Deus. A versão grátis não inclui setlists. Não há pagamento ou cartão.\n\n${email.text}`,
    html: email.html
      .replace('Sua biblioteca, sempre no mesmo endereço.', 'Seu acesso grátis está pronto.')
      .replace(
        'Use seu link pessoal para ouvir os áudios e abrir as partituras liberadas para sua conta.',
        'Experimente 2 partituras com playback: <strong>A Thousand Years</strong> e <strong>Perfect</strong>, e 2 guiadas em vídeo: <strong>My Way</strong> e <strong>Bondade de Deus</strong>. A versão grátis não inclui setlists. Sem pagamento ou cartão. Use seu link pessoal abaixo para entrar.',
      ),
  }
  return withEnglish(
    trial,
    'Your free Music Library access is ready',
    'Try two scores with backing tracks (A Thousand Years and Perfect) and two play-along score videos (My Way and Bondade de Deus). The free trial requires no payment card and excludes setlists.',
    link,
    support,
  )
}
