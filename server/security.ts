import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
  timingSafeEqual,
} from 'node:crypto'
import { WebhookSignatureValidator } from 'mercadopago'

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
  ) {
    super(message)
  }
}

export const hashToken = (value: string) => createHash('sha256').update(value).digest('hex')
export function checkToken(token: string, expected: string) {
  const actual = Buffer.from(hashToken(token))
  const target = Buffer.from(expected)
  return actual.length === target.length && timingSafeEqual(actual, target)
}

export function validateSignature(
  signature: string,
  requestId: string,
  dataId: string,
  secret: string,
) {
  try {
    if (!signature || !requestId || !dataId) throw new Error('Missing signature')
    // Orders IDs are signed in lowercase, per Mercado Pago's Orders webhook contract.
    WebhookSignatureValidator.validate({
      xSignature: signature,
      xRequestId: requestId,
      dataId: dataId.toLowerCase(),
      secret,
    })
  } catch {
    throw new AppError(401, 'INVALID_SIGNATURE', 'Assinatura inválida.')
  }
}

export function paymentUrl(value: string) {
  const url = new URL(value)
  if (
    url.protocol !== 'https:' ||
    url.hostname !== 'www.mercadopago.com.br' ||
    url.username ||
    url.password ||
    url.port ||
    !url.pathname.startsWith('/checkout/')
  ) {
    throw new AppError(502, 'INVALID_CHECKOUT_URL', 'O serviço retornou um endereço inválido.')
  }
  return url.href
}

export function encryptLink(link: string, key: string) {
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', Buffer.from(key, 'hex'), iv)
  const ciphertext = Buffer.concat([cipher.update(link, 'utf8'), cipher.final()])
  return Buffer.concat([iv, cipher.getAuthTag(), ciphertext]).toString('base64')
}
export function decryptLink(value: string, key: string) {
  const bytes = Buffer.from(value, 'base64')
  const decipher = createDecipheriv('aes-256-gcm', Buffer.from(key, 'hex'), bytes.subarray(0, 12))
  decipher.setAuthTag(bytes.subarray(12, 28))
  return Buffer.concat([decipher.update(bytes.subarray(28)), decipher.final()]).toString('utf8')
}
