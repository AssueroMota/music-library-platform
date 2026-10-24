const escape = (text: string) =>
  text.replace(
    /[&<>"']/g,
    (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!,
  )

export function confirmationEmail(productName: string, link: string, support: string) {
  return {
    text: `Seu acesso à Music Library está pronto!\n\nCompra confirmada: ${productName}.\n\nSeu link pessoal da biblioteca: ${link}\n\nGuarde este endereço nos favoritos. Ele continua o mesmo nas próximas visitas e reúne os materiais liberados para sua conta. Não compartilhe seu link pessoal.\n\nSuporte: ${support}`,
    html: `<!doctype html><html lang="pt-BR"><body style="margin:0;background:#faf8f3;font-family:Arial,sans-serif;color:#14263f"><table role="presentation" style="width:100%;padding:32px 16px"><tr><td align="center"><table role="presentation" style="max-width:560px;width:100%;border:1px solid #e0e4e8;border-radius:12px;background:white"><tr><td style="padding:30px;background:#0b1627;color:#e7c66c;font-size:22px;font-weight:bold">music library.</td></tr><tr><td style="padding:32px"><h1 style="font-size:24px">Seu repertório começa aqui.</h1><p style="line-height:1.7">Sua compra foi confirmada e o acesso a <strong>${escape(productName)}</strong> já está disponível.</p><p style="line-height:1.7">Use seu link pessoal para entrar. Sua biblioteca reúne os materiais dos produtos que você adquiriu.</p><p style="margin:30px 0"><a href="${escape(link)}" style="display:inline-block;padding:16px 24px;border-radius:6px;background:#24c45d;color:#072812;font-weight:bold;text-decoration:none">Acessar minha biblioteca</a></p><p style="font-size:13px;line-height:1.7;color:#5f6b7b">Guarde este endereço nos favoritos. Seu link continua o mesmo nas próximas visitas. Não compartilhe seu link pessoal.</p><hr style="border:0;border-top:1px solid #e0e4e8;margin:24px 0"><p style="font-size:13px">Precisa de ajuda? <a href="mailto:${escape(support)}">${escape(support)}</a></p></td></tr></table></td></tr></table></body></html>`,
  }
}

export function loginEmail(link: string, support: string) {
  return {
    text: `Seu link pessoal da Music Library: ${link}\n\nGuarde este endereço nos favoritos: ele continua o mesmo nas próximas visitas. O acesso mostra os materiais liberados para sua conta. Não compartilhe seu link pessoal.\n\nSe você não solicitou este acesso, ignore esta mensagem.\nSuporte: ${support}`,
    html: `<!doctype html><html lang="pt-BR"><body style="font-family:Arial,sans-serif;color:#14263f;background:#faf8f3;padding:24px"><main style="max-width:560px;margin:auto;background:#fff;padding:30px;border-radius:12px"><h1 style="font-size:24px">Sua biblioteca, sempre no mesmo endereço.</h1><p style="line-height:1.7">Use seu link pessoal para ouvir os áudios e abrir as partituras liberadas para sua conta.</p><p style="margin:28px 0"><a href="${escape(link)}" style="display:inline-block;padding:16px 24px;background:#24c45d;color:#072812;border-radius:6px;text-decoration:none;font-weight:bold">Acessar minha biblioteca</a></p><p style="font-size:13px;line-height:1.7">Guarde este endereço nos favoritos e não compartilhe seu link pessoal.</p><p style="font-size:13px">Se você não solicitou este acesso, ignore esta mensagem.</p><p style="font-size:13px">Suporte: <a href="mailto:${escape(support)}">${escape(support)}</a></p></main></body></html>`,
  }
}
