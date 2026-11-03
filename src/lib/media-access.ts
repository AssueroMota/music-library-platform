import { api, ApiError, LIBRARY_REQUEST_TIMEOUT_MS } from './api'

// Only this read-only request is retried. Access denials must remain visible.
export async function mediaAccessUrl(id: string, token: () => string, signal: AbortSignal) {
  for (let attempt = 0; ; attempt++) {
    signal.throwIfAborted()
    try {
      const result = await api<{ url: string }>(
        `/library/assets/${id}/view`,
        { headers: { Authorization: `Bearer ${token()}` }, signal },
        LIBRARY_REQUEST_TIMEOUT_MS,
      )
      if (!result.url || typeof result.url !== 'string')
        throw new ApiError('Não foi possível abrir o arquivo.', 'INVALID_RESPONSE')
      return result.url
    } catch (reason) {
      if (
        signal.aborted ||
        attempt >= 1 ||
        !(reason instanceof ApiError) ||
        !['NETWORK_ERROR', 'REQUEST_TIMEOUT', 'SERVICE_UNAVAILABLE', 'INVALID_RESPONSE'].includes(
          reason.code,
        )
      )
        throw reason
      await new Promise<void>((resolve, reject) => {
        const abort = () => {
          clearTimeout(timer)
          reject(signal.reason)
        }
        const timer = setTimeout(() => {
          signal.removeEventListener('abort', abort)
          resolve()
        }, 1000)
        signal.addEventListener('abort', abort, { once: true })
      })
    }
  }
}
