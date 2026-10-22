import { randomBytes, randomUUID } from 'node:crypto'
import { createServer } from 'node:net'
import { mkdir, rm } from 'node:fs/promises'
import { resolve, relative } from 'node:path'
import { execFileSync } from 'node:child_process'
import EmbeddedPostgres from 'embedded-postgres'
import type { TestProject } from 'vitest/node'

declare module 'vitest' {
  export interface ProvidedContext {
    databaseUrl: string
  }
}

export default async function setup(project: TestProject) {
  const root = resolve('node_modules/.cache')
  const folder = resolve(root, `checkout-test-${randomUUID()}`)
  if (relative(root, folder).startsWith('..')) throw new Error('Invalid test directory')
  await mkdir(root, { recursive: true })
  const server = createServer()
  await new Promise<void>((done) => server.listen(0, '127.0.0.1', done))
  const address = server.address()
  if (!address || typeof address === 'string') throw new Error('Missing port')
  const port = address.port
  await new Promise<void>((done) => server.close(() => done()))
  const password = randomBytes(16).toString('hex')
  const pg = new EmbeddedPostgres({
    databaseDir: folder,
    user: 'postgres',
    password,
    port,
    persistent: true,
    initdbFlags: ['--locale=C', '--encoding=UTF8'],
    // Exercise a non-UTC database too; production timestamps must be timezone-safe.
    postgresFlags: ['-h', '127.0.0.1', '-c', 'timezone=America/Sao_Paulo'],
    onLog: () => {},
    onError: () => {},
  })
  try {
    await pg.initialise()
    await pg.start()
    await pg.createDatabase('checkout_test')
    const url = `postgresql://postgres:${password}@127.0.0.1:${port}/checkout_test`
    execFileSync(process.execPath, ['node_modules/prisma/build/index.js', 'migrate', 'deploy'], {
      env: { ...process.env, DATABASE_URL: url },
      stdio: 'pipe',
      timeout: 60000,
    })
    project.provide('databaseUrl', url)
  } catch (error) {
    await pg.stop().catch(() => {})
    throw error
  }
  return async () => {
    await pg.stop()
    // The path is unique, resolved under node_modules/.cache and verified above.
    await rm(folder, { recursive: true, force: true, maxRetries: 10, retryDelay: 200 })
  }
}
