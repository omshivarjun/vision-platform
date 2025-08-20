import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock window and browser APIs
Object.defineProperty(window, 'navigator', {
  value: {
    userAgent: 'test-user-agent',
    onLine: true,
  },
  writable: true,
})

Object.defineProperty(window, 'screen', {
  value: {
    width: 1920,
    height: 1080,
  },
  writable: true,
})

Object.defineProperty(window, 'innerWidth', {
  value: 1920,
  writable: true,
})

Object.defineProperty(window, 'innerHeight', {
  value: 1080,
  writable: true,
})

Object.defineProperty(document, 'referrer', {
  value: 'https://example.com',
  writable: true,
})

Object.defineProperty(document, 'title', {
  value: 'Test Page',
  writable: true,
})

Object.defineProperty(document, 'hidden', {
  value: false,
  writable: true,
})

Object.defineProperty(window, 'performance', {
  value: {
    observer: vi.fn(() => ({
      observe: vi.fn(),
      disconnect: vi.fn(),
    })),
  },
  writable: true,
})

Object.defineProperty(window, 'speechSynthesis', {
  value: {
    speak: vi.fn(),
  },
  writable: true,
})

// Mock URL API
Object.defineProperty(window, 'URL', {
  value: {
    createObjectURL: vi.fn(() => 'blob:test'),
    revokeObjectURL: vi.fn(),
  },
  writable: true,
})

// Mock sendBeacon
Object.defineProperty(navigator, 'sendBeacon', {
  value: vi.fn(() => true),
  writable: true,
})

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
})

// Mock fetch
global.fetch = vi.fn()

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock matchMedia
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

// Mock console methods to reduce noise in tests
const originalConsoleError = console.error
const originalConsoleWarn = console.warn

beforeEach(() => {
  console.error = vi.fn()
  console.warn = vi.fn()
})

afterEach(() => {
  console.error = originalConsoleError
  console.warn = originalConsoleWarn
})


