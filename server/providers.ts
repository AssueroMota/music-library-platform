import { MercadoPagoConfig, Order as MPOrder } from 'mercadopago'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { z } from 'zod'
import type { Config } from './config.js'
import { confirmationEmail } from './email.js'

export const remoteOrderSchema = z.object({
  id: z.string(),
  type: z.literal('online'),
  processing_mode: z.literal('manual'),
  external_reference: z.string(),
  user_id: z.union([z.string(), z.number()]).transform(String),
  currency: z.literal('BRL'),
  total_amount: z.string(),
  total_paid_amount: z.string().optional(),
  status: z.string(),
  status_detail: z.string(),
  last_updated_date: z.iso.datetime({ offset: true }),
  checkout_url: z.string().optional(),
  payer: z.object({ email: z.email().transform((s) => s.trim().toLowerCase()) }).optional(),
  items: z.array(
    z.object({ external_code: z.string(), quantity: z.number().int(), unit_price: z.string() }),
  ),
  transactions: z
    .object({
      payments: z
        .array(
          z.object({
            id: z.string(),
            status: z.string(),
            status_detail: z.string(),
            amount: z.string(),
            paid_amount: z.string().optional(),
          }),
        )
        .default([]),
      refunds: z
        .array(z.object({ status: z.string().optional(), amount: z.string().optional() }))
        .optional(),
      chargebacks: z.array(z.object({ status: z.string().optional() })).optional(),
    })
    .optional(),
})
export type RemoteOrder = z.infer<typeof remoteOrderSchema>
export interface CheckoutInput {
  id: string
  productCode: string
  productName: string
  priceCents: number
}
export interface Providers {
  createOrder(input: CheckoutInput): Promise<{ id: string; checkoutUrl: string }>
  getOrder(id: string): Promise<RemoteOrder>
  createLogin(email: string): Promise<{ userId: string; email: string; link: string }>
  sendConfirmation(email: string, productName: string, link: string, key: string): Promise<void>
  sendLogin(email: string, link: string, key: string): Promise<void>
  authenticate(token: string): Promise<{ id: string; email: string } | null>
  signedDownload(storageKey: string): Promise<string>
}

export function createProviders(config: Config): Providers {
  const mp = new MPOrder(
    new MercadoPagoConfig({
      accessToken: config.MERCADO_PAGO_ACCESS_TOKEN,
      options: { timeout: 10000, maxRetries: 0 },
    }),
  )
  const supabase = createClient(config.SUPABASE_URL, config.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => fetch(input, { ...init, signal: AbortSignal.timeout(10000) }),
    },
  })
  const resend = new Resend(config.RESEND_API_KEY)
  return {
    async createOrder(input) {
      const amount = (input.priceCents / 100).toFixed(2)
      const back = (state: string) => `${config.FRONTEND_URL}/checkout/${state}?order=${input.id}`
      const response = await mp.create({
        requestOptions: { idempotencyKey: input.id },
        body: {
          type: 'online',
          processing_mode: 'manual',
          capture_mode: 'automatic_async',
          total_amount: amount,
          external_reference: input.id,
          expiration_time: 'P1D',
          description: input.productName,
          items: [
            {
              external_code: input.productCode,
              title: input.productName,
              unit_price: amount,
              quantity: 1,
            },
          ],
          config: {
            online: {
              success_url: back('success'),
              pending_url: back('pending'),
              failure_url: back('failure'),
              auto_return: 'all',
            },
          },
        },
      })
      if (!response.id || !response.checkout_url) throw new Error('CHECKOUT_RESPONSE_INVALID')
      // Orders from the wrong account/environment must never be used.
      if (
        String(response.user_id) !== config.MERCADO_PAGO_SELLER_ID ||
        response.currency !== 'BRL' ||
        response.id.startsWith('ORDTST') !== (config.MERCADO_PAGO_MODE === 'test')
      )
        throw new Error('CHECKOUT_ACCOUNT_MISMATCH')
      return { id: response.id, checkoutUrl: response.checkout_url }
    },
    async getOrder(id) {
      return remoteOrderSchema.parse(await mp.get({ id }))
    },
    async createLogin(email) {
      // Supabase creates the user when absent and reuses an existing account for magiclink.
      const { data, error } = await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email,
        options: { redirectTo: `${config.FRONTEND_URL}/biblioteca` },
      })
      if (error || !data.user?.email || !data.properties?.action_link)
        throw new Error('AUTH_LINK_FAILED')
      return {
        userId: data.user.id,
        email: data.user.email.toLowerCase(),
        link: data.properties.action_link,
      }
    },
    async sendConfirmation(email, productName, link, key) {
      const { error } = await resend.emails.send(
        {
          from: config.EMAIL_FROM,
          to: email,
          replyTo: config.SUPPORT_EMAIL,
          subject: 'Seu acesso à Music Library está pronto!',
          ...confirmationEmail(productName, link, config.SUPPORT_EMAIL),
        },
        { idempotencyKey: key, signal: AbortSignal.timeout(10000) },
      )
      if (error) throw new Error('EMAIL_SEND_FAILED')
    },
    async authenticate(token) {
      const { data, error } = await supabase.auth.getUser(token)
      return error || !data.user?.email
        ? null
        : { id: data.user.id, email: data.user.email.toLowerCase() }
    },
    async sendLogin(email, link, key) {
      const { error } = await resend.emails.send(
        {
          from: config.EMAIL_FROM,
          to: email,
          replyTo: config.SUPPORT_EMAIL,
          subject: 'Seu link de acesso à Music Library',
          text: `Acesse sua biblioteca pelo link pessoal: ${link}\n\nSe você não solicitou este acesso, ignore esta mensagem.\nSuporte: ${config.SUPPORT_EMAIL}`,
        },
        { idempotencyKey: key, signal: AbortSignal.timeout(10000) },
      )
      if (error) throw new Error('EMAIL_SEND_FAILED')
    },
    async signedDownload(storageKey) {
      const { data, error } = await supabase.storage
        .from(config.SUPABASE_STORAGE_BUCKET)
        .createSignedUrl(storageKey, 60, { download: true })
      if (error || !data?.signedUrl) throw new Error('DOWNLOAD_FAILED')
      return data.signedUrl
    },
  }
}
