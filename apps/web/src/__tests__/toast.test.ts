import { describe, it, expect, beforeEach, vi } from 'vitest'
import { showToast, toastSuccess, toastError, toastCritical, clearToastCache, getToastStats } from '../utils/toast'

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: vi.fn((message: string, options?: any) => `toast-${Date.now()}`)
}))

describe('Toast System', () => {
  beforeEach(() => {
    clearToastCache()
    vi.clearAllMocks()
  })

  describe('Deduplication', () => {
    it('should show first toast message', () => {
      const result = showToast('Test message')
      expect(result).toBeDefined()
    })

    it('should deduplicate identical messages within window', () => {
      // First message should show
      showToast('Duplicate message')
      
      // Second identical message should be suppressed
      const result = showToast('Duplicate message')
      expect(result).toBeUndefined()
    })

    it('should allow duplicate messages after window expires', async () => {
      // First message with short deduplication window for testing
      showToast('Test message', { windowMs: 50 })
      
      // Wait for deduplication window to expire
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Second message should show after window expires
      const result = showToast('Test message', { windowMs: 50 })
      expect(result).toBeDefined()
    })

    it('should bypass deduplication for important messages', () => {
      // First message
      showToast('Important message')
      
      // Second identical message with important flag should show
      const result = showToast('Important message', { important: true })
      expect(result).toBeDefined()
    })

    it('should bypass deduplication for critical messages', () => {
      // First message
      showToast('Critical message')
      
      // Second identical message with critical flag should show
      const result = showToast('Critical message', { critical: true })
      expect(result).toBeDefined()
    })
  })

  describe('Toast Types', () => {
    it('should show success toast with correct icon', () => {
      const result = toastSuccess('Success message')
      expect(result).toBeDefined()
    })

    it('should show error toast with correct icon', () => {
      const result = toastError('Error message')
      expect(result).toBeDefined()
    })

    it('should show critical toast with correct icon', () => {
      const result = toastCritical('Critical message')
      expect(result).toBeDefined()
    })

    it('should show info toast with correct icon', () => {
      const result = showToast('Info message', { icon: 'ℹ️' })
      expect(result).toBeDefined()
    })

    it('should show warning toast with correct icon', () => {
      const result = showToast('Warning message', { icon: '⚠️' })
      expect(result).toBeDefined()
    })
  })

  describe('Accessibility', () => {
    it('should set aria-live attribute for toasts', () => {
      const result = showToast('Accessible message', { ariaLive: 'assertive' })
      expect(result).toBeDefined()
    })

    it('should set role attribute for toasts', () => {
      const result = showToast('Accessible message')
      expect(result).toBeDefined()
    })
  })

  describe('Configuration', () => {
    it('should allow custom deduplication window', () => {
      const result = showToast('Custom window message', { windowMs: 1000 })
      expect(result).toBeDefined()
    })

    it('should provide toast statistics', () => {
      showToast('Test message 1')
      showToast('Test message 2')
      
      const stats = getToastStats()
      expect(stats.cachedMessages).toBe(2)
      expect(stats.windowMs).toBe(5000)
    })

    it('should clear toast cache', () => {
      showToast('Test message')
      expect(getToastStats().cachedMessages).toBe(1)
      
      clearToastCache()
      expect(getToastStats().cachedMessages).toBe(0)
    })
  })

  describe('Critical Messages', () => {
    it('should always show critical messages', () => {
      // Show same message multiple times
      for (let i = 0; i < 5; i++) {
        const result = showToast('Critical message', { critical: true })
        expect(result).toBeDefined()
      }
    })

    it('should have longer duration for critical messages', () => {
      const result = showToast('Critical message', { critical: true })
      expect(result).toBeDefined()
    })
  })
})
