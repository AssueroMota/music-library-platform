import { readFile, writeFile } from 'node:fs/promises'
import { randomBytes } from 'node:crypto'
import { createInterface } from 'node:readline/promises'
import { Writable } from 'node:stream'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'
import { parse } from 'dotenv'
import { PrismaClient } from '@prisma/client'

const envPath = new URL('../.env', import.meta.url)

function replaceSetting(source, name, value) {
  const pattern = new RegExp(`^${name}=[^\\r\\n]*`, 'gm')
  const matches = source.match(pattern) ?? []
  if (matches.length > 1) throw new Error(`A variável ${name} está repetida no .env.`)
  const line = `${name}=${JSON.stringify(value)}`
  return matches.length ? source.replace(pattern, () => line) : `${source.trimEnd()}\n${line}\n`
}

export function prepareEnvironment(source, password) {
  const env = parse(source)
  if (!password || /[\r\n\0]/.test(password))
    throw new Error('Informe uma senha válida, sem quebras de linha.')
  let url
  try {
    url = new URL(env.DATABASE_URL)
  } catch {
    throw new Error('Cole primeiro a URI do Session pooler em DATABASE_URL.')
  }
  const username = decodeURIComponent(url.username)
  const project = /^postgres\.([a-z0-9]+)$/.exec(username)?.[1]
  if (
    !['postgres:', 'postgresql:'].includes(url.protocol) ||
    !url.hostname.endsWith('.pooler.supabase.com') ||
    url.port !== '5432' ||
    url.pathname !== '/postgres' ||
    !project
  ) {
    throw new Error(
      'Use a URI do Supabase Session pooler, com usuário postgres.PROJETO e porta 5432.',
    )
  }
  // Encode the password as one URL component, including literal %, @, # and /.
  url.password = encodeURIComponent(password)
  url.searchParams.set('sslmode', 'require')
  if (!url.searchParams.has('connection_limit')) url.searchParams.set('connection_limit', '5')
  if (!url.searchParams.has('connect_timeout')) url.searchParams.set('connect_timeout', '20')
  const projectUrl = `https://${project}.supabase.co`
  for (const name of ['SUPABASE_URL', 'VITE_SUPABASE_URL']) {
    if (env[name]?.trim() && env[name].replace(/\/$/, '') !== projectUrl) {
      throw new Error(
        `A variável ${name} aponta para outro projeto. Confira o .env antes de continuar.`,
      )
    }
  }
  let text = replaceSetting(source, 'DATABASE_URL', url.href)
  text = replaceSetting(text, 'SUPABASE_URL', projectUrl)
  text = replaceSetting(text, 'VITE_SUPABASE_URL', projectUrl)
  if (!env.EMAIL_LINK_ENCRYPTION_KEY?.trim()) {
    text = replaceSetting(text, 'EMAIL_LINK_ENCRYPTION_KEY', randomBytes(32).toString('hex'))
  }
  return { text, databaseUrl: url.href }
}

async function hiddenPassword() {
  if (!process.stdin.isTTY)
    throw new Error('Execute este comando no terminal interativo do seu editor.')
  // Readline controls terminal input; its entire output is discarded so typed/pasted
  // characters cannot appear in the terminal, history, or application logs.
  const silentOutput = new Writable({
    write(_chunk, _encoding, done) {
      done()
    },
  })
  const reader = createInterface({
    input: process.stdin,
    output: silentOutput,
    terminal: true,
    historySize: 0,
  })
  const abort = new AbortController()
  reader.once('SIGINT', () => abort.abort())
  reader.once('close', () => abort.abort())
  process.stdout.write('Senha do banco Supabase (a digitação ficará oculta): ')
  try {
    return await reader.question('', { signal: abort.signal })
  } finally {
    reader.close()
    process.stdout.write('\n')
  }
}

async function main() {
  const source = await readFile(envPath, 'utf8')
  const password = await hiddenPassword()
  const prepared = prepareEnvironment(source, password)
  const db = new PrismaClient({
    datasourceUrl: prepared.databaseUrl,
    errorFormat: 'minimal',
    log: [],
  })
  console.info('Verificando a conexão com o banco…')
  try {
    await db.$queryRaw`SELECT 1`
  } catch {
    // Provider errors can contain connection strings; never print them.
    throw new Error(
      'Não foi possível conectar. Confira a senha e a URI do Session pooler. O arquivo não foi alterado.',
    )
  } finally {
    await db.$disconnect()
  }
  if ((await readFile(envPath, 'utf8')) !== source) {
    throw new Error(
      'O .env foi alterado durante a verificação. Salve o arquivo e execute o comando novamente.',
    )
  }
  await writeFile(envPath, prepared.text, { encoding: 'utf8', mode: 0o600 })
  console.info(
    'Conexão validada. DATABASE_URL, URLs do Supabase e chave interna configuradas no .env.',
  )
  console.info('Nenhuma tabela foi criada ou modificada. Volte ao chat e informe: banco conectado.')
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  main().catch((error) => {
    if (error?.name === 'AbortError')
      console.error('Configuração cancelada. O arquivo não foi alterado.')
    else if (error?.code === 'ENOENT')
      console.error('Arquivo .env não encontrado. Copie .env.example para .env primeiro.')
    else
      console.error(
        error instanceof Error && !error.code
          ? error.message
          : 'Não foi possível configurar o banco. Omitimos os detalhes para proteger as credenciais.',
      )
    process.exitCode = 1
  })
}
