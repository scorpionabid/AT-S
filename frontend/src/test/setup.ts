import '@testing-library/jest-dom'
import { expect, afterEach, beforeAll, afterAll, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

// Mock fetch globally with a simple implementation
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
  } as Response)
)

// Start server before all tests - with error handling
beforeAll(async () => {
  try {
    const { server } = await import('./mocks/server')
    server.listen({ 
      onUnhandledRequest: 'bypass',
      quiet: true
    })
    // Store server reference for cleanup
    ;(globalThis as any).__MSW_SERVER__ = server
  } catch (error) {
    console.warn('MSW server setup failed, continuing without mocking:', error)
  }
})

// Close server after all tests
afterAll(async () => {
  try {
    const server = (globalThis as any).__MSW_SERVER__
    if (server) {
      server.close()
    }
  } catch (error) {
    console.warn('MSW server close failed:', error)
  }
})

// Reset handlers after each test
afterEach(async () => {
  try {
    const server = (globalThis as any).__MSW_SERVER__
    if (server) {
      server.resetHandlers()
    }
  } catch (error) {
    console.warn('MSW handler reset failed:', error)
  }
  cleanup()
})

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))