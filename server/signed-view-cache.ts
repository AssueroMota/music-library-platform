type Entry = { expiresAt: number; value: Promise<string> }

// This caches only the storage signature. Callers must authenticate and authorize
// the asset against the database before every lookup, including cache hits.
export class SignedViewCache {
  private readonly entries = new Map<string, Entry>()

  constructor(
    private readonly ttlMs = 120000,
    private readonly limit = 256,
  ) {}

  get(userId: string, storageKey: string, load: () => Promise<string>, refresh = false) {
    const key = JSON.stringify([userId, storageKey])
    const now = Date.now()
    const existing = this.entries.get(key)
    if (!refresh && existing && existing.expiresAt > now) return existing.value

    // Start the TTL before signing, well inside the URL's 600-second lifetime.
    // Bound memory even when many accounts request different files.
    this.entries.delete(key)
    for (const [oldKey, entry] of this.entries) {
      if (entry.expiresAt <= now) this.entries.delete(oldKey)
    }
    while (this.entries.size >= this.limit) {
      const oldest = this.entries.keys().next().value
      if (oldest === undefined) break
      this.entries.delete(oldest)
    }
    const entry: Entry = {
      expiresAt: now + this.ttlMs,
      value: Promise.resolve().then(load),
    }
    this.entries.set(key, entry)
    void entry.value.catch(() => {
      if (this.entries.get(key) === entry) this.entries.delete(key)
    })
    return entry.value
  }
}
