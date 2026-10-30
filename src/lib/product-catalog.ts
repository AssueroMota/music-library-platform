import { violinLaunch } from '../../shared/violin-launch'
import { api, type ProductResponse } from './api'

const cacheTtlMs = 60000
const requestTimeoutMs = 60000
const priceBoundaries = [Date.parse(violinLaunch.startsAt), Date.parse(violinLaunch.endsAt)]

function nextPriceBoundary(now: number) {
  return priceBoundaries.find((boundary) => boundary > now) ?? Infinity
}

// Only public product data is shared. Payment requests never enter this cache.
export class ProductCatalog {
  private cached: { data: ProductResponse; expiresAt: number } | null = null
  private pending: {
    promise: Promise<ProductResponse>
    controller: AbortController
    priceBoundary: number
  } | null = null

  peek(): ProductResponse | null {
    return this.cached && Date.now() < this.cached.expiresAt ? this.cached.data : null
  }

  invalidate() {
    this.cached = null
    this.pending?.controller.abort()
    this.pending = null
  }

  load({ refresh = false } = {}): Promise<ProductResponse> {
    if (refresh) this.invalidate()
    const cached = this.peek()
    if (cached) return Promise.resolve(cached)
    if (this.pending) {
      if (Date.now() < this.pending.priceBoundary) return this.pending.promise
      this.invalidate()
    }

    const controller = new AbortController()
    const priceBoundary = nextPriceBoundary(Date.now())
    const promise: Promise<ProductResponse> = api<ProductResponse>(
      '/products',
      { signal: controller.signal },
      requestTimeoutMs,
    )
      .then((data) => {
        if (this.pending?.promise === promise)
          this.cached = {
            data,
            expiresAt: Math.min(Date.now() + cacheTtlMs, priceBoundary),
          }
        return data
      })
      .finally(() => {
        if (this.pending?.promise === promise) this.pending = null
      })
    this.pending = { promise, controller, priceBoundary }
    return promise
  }

  prefetch() {
    // A background lookup must not block the page or leave an unhandled rejection.
    void this.load().catch(() => {})
  }
}

export const productCatalog = new ProductCatalog()
