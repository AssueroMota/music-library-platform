import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { configSchema } from './config.js'
import { createProviders } from './providers.js'
import { CheckoutService } from './service.js'
import { createApp } from './app.js'

const parsed = configSchema.safeParse(process.env)
if (!parsed.success) {
  console.error(
    'Configuração inválida. Verifique as variáveis:',
    parsed.error.issues.map((i) => i.path.join('.') || i.message).join(', '),
  )
  process.exit(1)
}
const config = parsed.data
const db = new PrismaClient()
const service = new CheckoutService(db, createProviders(config), config)
const app = createApp(service)
let running = false
const timer = setInterval(async () => {
  if (running) return
  running = true
  try {
    await service.runJobs()
  } catch {
    app.log.error({ code: 'WORKER_FAILED' }, 'Falha na fila de processamento')
  } finally {
    running = false
  }
}, 2000)
timer.unref()
for (const signal of ['SIGINT', 'SIGTERM'] as const)
  process.on(signal, async () => {
    clearInterval(timer)
    await app.close()
    // In-flight leases are recoverable after process termination.
    await db.$disconnect()
    process.exit(0)
  })
try {
  await db.$connect()
  await app.listen({ port: config.PORT, host: config.HOST })
} catch {
  console.error('Não foi possível iniciar a API. Confira o banco, a porta e a configuração.')
  clearInterval(timer)
  await db.$disconnect()
  process.exit(1)
}
