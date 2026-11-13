import { Prisma, type LibraryAsset, type PrismaClient, type Product } from '@prisma/client'

type LibraryDb = Pick<PrismaClient, '$queryRaw'>
export type StoredLibraryLink = { id: string; secretCiphertext: string }
type LibrarySnapshot = {
  products: Pick<Product, 'id' | 'name' | 'accessType' | 'instrument'>[]
  previews: { instrument: string; expiresAt: string }[]
  freeAccess: boolean
  assets: LibraryAsset[]
  link: StoredLibraryLink | null
}

// Keep authorization in the database on every request. Joining related tables here
// avoids the separate network round trips produced by nested Prisma includes.
function accessScope(userId: string, now: Date) {
  return Prisma.sql`
    active_products AS (
      SELECT DISTINCT p.id, p.name, p."accessType", p.instrument
      FROM entitlements e
      JOIN orders o ON o.id = e."orderId" AND o.status = 'APPROVED'
      JOIN products p ON p.id = e."productId"
      WHERE e."userId" = ${userId}::uuid AND e."revokedAt" IS NULL
    ),
    active_previews AS (
      SELECT instrument, "expiresAt"
      FROM library_preview_access
      WHERE "userId" = ${userId}::uuid AND "revokedAt" IS NULL AND "expiresAt" > ${now}
    ),
    active_free_access AS (
      SELECT id FROM library_free_access
      WHERE "userId" = ${userId}::uuid AND "revokedAt" IS NULL
    )`
}

// The asset alias is always defined by the static SQL below; only values are interpolated.
const assetAccess = Prisma.sql`
  EXISTS (
    SELECT 1 FROM active_products p
    WHERE p."accessType" = 'COMPLETE'
      OR (p.instrument = a.instrument AND (
        p."accessType" = 'INSTRUMENT' OR (p."accessType" = 'SCORES' AND a.kind = 'score')
      ))
  ) OR EXISTS (SELECT 1 FROM active_previews v WHERE v.instrument = a.instrument)
    OR (EXISTS (SELECT 1 FROM active_free_access)
      AND EXISTS (SELECT 1 FROM library_free_samples s WHERE s."assetId" = a.id))`

export async function librarySnapshot(db: LibraryDb, userId: string) {
  const [snapshot] = await db.$queryRaw<LibrarySnapshot[]>(Prisma.sql`
    WITH ${accessScope(userId, new Date())}
    SELECT
      COALESCE((SELECT jsonb_agg(to_jsonb(p)) FROM active_products p), '[]'::jsonb) AS products,
      COALESCE((SELECT jsonb_agg(to_jsonb(v)) FROM active_previews v), '[]'::jsonb) AS previews,
      EXISTS (SELECT 1 FROM active_free_access) AS "freeAccess",
      COALESCE((
        SELECT jsonb_agg(jsonb_build_object(
          'id', a.id, 'title', a.title, 'songTitle', a."songTitle",
          'artist', a.artist, 'style', a.style, 'kind', a.kind,
          'instrument', a.instrument, 'storageKey', a."storageKey"
        ) ORDER BY a.title)
        FROM library_assets a WHERE ${assetAccess}
      ), '[]'::jsonb) AS assets,
      (
        SELECT jsonb_build_object('id', l.id, 'secretCiphertext', l."secretCiphertext")
        FROM library_access_links l WHERE l."userId" = ${userId}::uuid
      ) AS link
  `)
  return snapshot
}

export async function libraryAssetAccess(db: LibraryDb, userId: string, assetId: string) {
  const [asset] = await db.$queryRaw<{ storageKey: string; allowed: boolean }[]>(Prisma.sql`
    WITH ${accessScope(userId, new Date())}
    SELECT a."storageKey", (${assetAccess}) AS allowed
    FROM library_assets a WHERE a.id = ${assetId}::uuid
  `)
  return asset
}

export async function personalAccessRecord(db: LibraryDb, linkId: string) {
  const [link] = await db.$queryRaw<
    {
      userId: string
      email: string
      secretHash: string
      hasAccess: boolean
    }[]
  >`
    SELECT l."userId", u.email, l."secretHash", (
      EXISTS (
        SELECT 1 FROM entitlements e
        JOIN orders o ON o.id = e."orderId" AND o.status = 'APPROVED'
        WHERE e."userId" = l."userId" AND e."revokedAt" IS NULL
      ) OR EXISTS (
        SELECT 1 FROM library_preview_access v
        WHERE v."userId" = l."userId" AND v."revokedAt" IS NULL AND v."expiresAt" > ${new Date()}
      ) OR EXISTS (
        SELECT 1 FROM library_free_access f
        WHERE f."userId" = l."userId" AND f."revokedAt" IS NULL
      )
    ) AS "hasAccess"
    FROM library_access_links l JOIN users u ON u.id = l."userId"
    WHERE l.id = ${linkId}::uuid
  `
  return link
}

export async function freeOnlySetlistAccess(db: LibraryDb, userId: string) {
  const [access] = await db.$queryRaw<{ denied: boolean }[]>(Prisma.sql`
    WITH ${accessScope(userId, new Date())}
    SELECT (
      EXISTS (SELECT 1 FROM library_free_access WHERE "userId" = ${userId}::uuid)
      AND NOT EXISTS (SELECT 1 FROM active_products)
      AND NOT EXISTS (SELECT 1 FROM active_previews)
    ) AS denied
  `)
  return access.denied
}
