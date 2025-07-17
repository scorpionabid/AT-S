import '@testing-library/jest-dom'
import { expect, afterEach, beforeAll, afterAll, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import { server } from './mocks/server'

// Mock fetch globally
Object.defineProperty(global, 'fetch', {
  value: vi.fn(),
  writable: true,
  configurable: true
})

// Start server before all tests
beforeAll(() => {
  try {
    server.listen({ 
      onUnhandledRequest: 'bypass',
      quiet: true
    })
  } catch (error) {
    console.warn('MSW server setup failed:', error)
  }
})

// Close server after all tests
afterAll(() => {
  try {
    server.close()
  } catch (error) {
    console.warn('MSW server close failed:', error)
  }
})

// Reset handlers after each test `important for test isolation`
afterEach(() => {
  try {
    server.resetHandlers()
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