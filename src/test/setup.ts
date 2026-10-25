import '@testing-library/jest-dom/vitest'
import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

afterEach(cleanup)

// JSDOM has no audio engine. Model a browser that requires a click for audio.
HTMLMediaElement.prototype.play = vi
  .fn()
  .mockRejectedValue(new DOMException('User interaction required', 'NotAllowedError'))
HTMLMediaElement.prototype.pause = vi.fn(function (this: HTMLMediaElement) {
  this.dispatchEvent(new Event('pause'))
})

// JSDOM has no layout engine. Viewport animations are intentionally inert here;
// visual responsiveness remains a separate real-browser check.
vi.stubGlobal(
  'IntersectionObserver',
  class {
    observe = vi.fn()
    unobserve = vi.fn()
    disconnect = vi.fn()
  },
)

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

HTMLDialogElement.prototype.showModal = function () {
  this.open = true
}
HTMLDialogElement.prototype.close = function () {
  this.open = false
  this.dispatchEvent(new Event('close'))
}
