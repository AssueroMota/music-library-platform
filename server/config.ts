import { z } from 'zod'

const origin = z.url().transform((url) => new URL(url).origin)
export const configSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().positive().default(3001),
    HOST: z.string().default('127.0.0.1'),
    DATABASE_URL: z.string().min(1),
    MERCADO_PAGO_ACCESS_TOKEN: z.string().min(1),
    MERCADO_PAGO_WEBHOOK_SECRET: z.string().min(16),
    MERCADO_PAGO_SELLER_ID: z.string().regex(/^\d+$/),
    MERCADO_PAGO_MODE: z.enum(['test', 'production']).default('test'),
    SUPABASE_URL: z.url(),
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
    SUPABASE_STORAGE_BUCKET: z.string().default('music-library'),
    RESEND_API_KEY: z.string().min(1),
    EMAIL_FROM: z.string().min(1),
    SUPPORT_EMAIL: z.email(),
    FRONTEND_URL: origin,
    BACKEND_URL: origin,
    // Encrypt temporary authentication links in the persistent email outbox.
    EMAIL_LINK_ENCRYPTION_KEY: z.string().regex(/^[a-fA-F0-9]{64}$/),
    CHECKOUT_ENABLED: z
      .enum(['true', 'false'])
      .default('false')
      .transform((s) => s === 'true'),
  })
  .superRefine((config, ctx) => {
    if (
      config.MERCADO_PAGO_MODE === 'production' &&
      ![config.FRONTEND_URL, config.BACKEND_URL].every((url) => url.startsWith('https://'))
    ) {
      ctx.addIssue({ code: 'custom', message: 'Produção exige URLs HTTPS.' })
    }
  })

export type Config = z.infer<typeof configSchema>
