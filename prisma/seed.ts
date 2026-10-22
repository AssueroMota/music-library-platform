import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { catalog } from '../shared/products.js'

const db = new PrismaClient()
try {
  for (const product of catalog) {
    await db.product.upsert({
      where: { id: product.id },
      update: {}, // Never silently overwrite operational prices/availability on a second seed.
      create: {
        ...product,
        description: 'Partituras e backing tracks organizados em pastas.',
        accessType: product.instrument ? 'INSTRUMENT' : 'COMPLETE',
        available: true,
      },
    })
  }
} finally {
  await db.$disconnect()
}
