import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { configSchema } from './config.js'
import { CheckoutService } from './service.js'
import { createProviders } from './providers.js'

const config = configSchema.parse(process.env)
const db = new PrismaClient()
const service = new CheckoutService(db, createProviders(config), config)
try {
  const id = process.argv[2]
  if (!id || !/^ORD[A-Z0-9]+$/i.test(id))
    throw new Error('Informe o identificador ORD do Mercado Pago.')
  await service.reconcile(id)
  await service.runJobs()
  console.info('Pedido reconciliado; confira o status e a fila no banco.')
} finally {
  await db.$disconnect()
}
