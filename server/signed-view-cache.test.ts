import { afterEach, expect, it, vi } from 'vitest'
import { SignedViewCache } from './signed-view-cache.js'

afterEach(() => vi.useRealTimers())

it('reuses a signature for one account and file, without sharing across accounts', async () => {
  const cache = new SignedViewCache()
  const sign = vi.fn(async () => 'signed-url')
  await Promise.all([cache.get('one', 'score.pdf', sign), cache.get('one', 'score.pdf', sign)])
  expect(sign).toHaveBeenCalledTimes(1)
  await cache.get('two', 'score.pdf', sign)
  await cache.get('one', 'other.pdf', sign)
  expect(sign).toHaveBeenCalledTimes(3)
})

it('renews signatures after the TTL and immediately when recovery requests it', async () => {
  vi.useFakeTimers()
  const cache = new SignedViewCache()
  const sign = vi.fn(async () => 'signed-url')
  await cache.get('one', 'score.pdf', sign)
  await vi.advanceTimersByTimeAsync(119999)
  await cache.get('one', 'score.pdf', sign)
  expect(sign).toHaveBeenCalledTimes(1)
  await vi.advanceTimersByTimeAsync(1)
  await cache.get('one', 'score.pdf', sign)
  await cache.get('one', 'score.pdf', sign, true)
  expect(sign).toHaveBeenCalledTimes(3)
})

it('does not cache a storage failure', async () => {
  const cache = new SignedViewCache()
  const sign = vi
    .fn()
    .mockRejectedValueOnce(new Error('Storage failed'))
    .mockResolvedValue('new-url')
  await expect(cache.get('one', 'score.pdf', sign)).rejects.toThrow('Storage failed')
  await expect(cache.get('one', 'score.pdf', sign)).resolves.toBe('new-url')
  expect(sign).toHaveBeenCalledTimes(2)
})

it('bounds the number of retained signatures', async () => {
  const cache = new SignedViewCache(120000, 2)
  const sign = vi.fn(async () => 'signed-url')
  for (const file of ['a.pdf', 'b.pdf', 'c.pdf']) await cache.get('one', file, sign)
  await cache.get('one', 'b.pdf', sign)
  expect(sign).toHaveBeenCalledTimes(3)
  await cache.get('one', 'a.pdf', sign)
  expect(sign).toHaveBeenCalledTimes(4)
})

it('does not discard a renewed URL when an older in-flight signature fails', async () => {
  const cache = new SignedViewCache()
  let reject!: (reason: Error) => void
  const stale = cache.get(
    'one',
    'score.pdf',
    () =>
      new Promise((_resolve, fail) => {
        reject = fail
      }),
  )
  const failure = expect(stale).rejects.toThrow('Old request failed')
  await cache.get('one', 'score.pdf', async () => 'new-url', true)
  reject(new Error('Old request failed'))
  await failure
  const sign = vi.fn(async () => 'unexpected-url')
  await expect(cache.get('one', 'score.pdf', sign)).resolves.toBe('new-url')
  expect(sign).not.toHaveBeenCalled()
})
