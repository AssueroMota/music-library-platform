import { act, render } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import { SalesHeader } from '../components/SalesHeader'

it('atualiza o espaço de navegação quando a altura do header muda e limpa ao sair', () => {
  let height = 88
  let resize: ResizeObserverCallback | undefined
  const disconnect = vi.fn()
  const original = Object.getOwnPropertyDescriptor(globalThis, 'ResizeObserver')
  const rect = vi
    .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
    .mockImplementation(() => ({ height }) as DOMRect)
  Object.defineProperty(globalThis, 'ResizeObserver', {
    configurable: true,
    value: class {
      constructor(callback: ResizeObserverCallback) {
        resize = callback
      }
      observe = vi.fn()
      disconnect = disconnect
    },
  })
  try {
    const { unmount } = render(<SalesHeader onFree={() => {}} onCheckout={() => {}} />)
    expect(document.documentElement.style.getPropertyValue('--sales-header-height')).toBe('88px')
    height = 136
    act(() => resize?.([], {} as ResizeObserver))
    expect(document.documentElement.style.getPropertyValue('--sales-header-height')).toBe('136px')
    unmount()
    expect(disconnect).toHaveBeenCalledOnce()
    expect(document.documentElement.style.getPropertyValue('--sales-header-height')).toBe('')
  } finally {
    rect.mockRestore()
    if (original) Object.defineProperty(globalThis, 'ResizeObserver', original)
    else Reflect.deleteProperty(globalThis, 'ResizeObserver')
  }
})
