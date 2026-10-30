import { vi } from 'vitest'

export function fakePaymentTab() {
  const storage = new Map<string, string>()
  const tab = {
    opener: window as Window | null,
    document: document.implementation.createHTMLDocument(),
    closed: false,
    sessionStorage: { setItem: vi.fn((key: string, value: string) => storage.set(key, value)) },
    location: { replace: vi.fn() },
    close: vi.fn(),
  }
  return { tab, handle: tab as unknown as Window, storage }
}
