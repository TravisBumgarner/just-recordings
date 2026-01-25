import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { CountdownState } from '../countdownIpc'
import {
  calculateProgress,
  clearCountdownProgress,
  clearDockBadge,
  setDockBadge,
  showCountdownProgress,
  updateCountdownProgress,
} from '../taskbarProgress'

// Mock electron
vi.mock('electron', () => ({
  app: {
    dock: {
      setBadge: vi.fn(),
    },
  },
  BrowserWindow: vi.fn(),
}))

// Get the mocked electron module
import { app } from 'electron'

describe('taskbarProgress', () => {
  // Mock BrowserWindow instance
  const createMockWindow = () => ({
    setProgressBar: vi.fn(),
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('calculateProgress', () => {
    it('returns 1 when countdown is at full (3 of 3)', () => {
      const state: CountdownState = { totalSeconds: 3, secondsRemaining: 3 }
      expect(calculateProgress(state)).toBe(1)
    })

    it('returns 0.67 when 2 of 3 seconds remain', () => {
      const state: CountdownState = { totalSeconds: 3, secondsRemaining: 2 }
      expect(calculateProgress(state)).toBeCloseTo(0.67, 1)
    })

    it('returns 0.33 when 1 of 3 seconds remain', () => {
      const state: CountdownState = { totalSeconds: 3, secondsRemaining: 1 }
      expect(calculateProgress(state)).toBeCloseTo(0.33, 1)
    })

    it('returns 0 when countdown is complete', () => {
      const state: CountdownState = { totalSeconds: 3, secondsRemaining: 0 }
      expect(calculateProgress(state)).toBe(0)
    })

    it('handles different total seconds', () => {
      const state: CountdownState = { totalSeconds: 5, secondsRemaining: 2 }
      expect(calculateProgress(state)).toBe(0.4)
    })

    it('returns 0 when totalSeconds is 0 to avoid division by zero', () => {
      const state: CountdownState = { totalSeconds: 0, secondsRemaining: 0 }
      expect(calculateProgress(state)).toBe(0)
    })
  })

  describe('setDockBadge', () => {
    it('sets the dock badge on macOS', () => {
      const originalPlatform = process.platform
      Object.defineProperty(process, 'platform', { value: 'darwin' })

      setDockBadge('3')

      expect(app.dock.setBadge).toHaveBeenCalledWith('3')

      Object.defineProperty(process, 'platform', { value: originalPlatform })
    })

    it('does not set dock badge on Windows', () => {
      const originalPlatform = process.platform
      Object.defineProperty(process, 'platform', { value: 'win32' })

      setDockBadge('3')

      expect(app.dock.setBadge).not.toHaveBeenCalled()

      Object.defineProperty(process, 'platform', { value: originalPlatform })
    })
  })

  describe('clearDockBadge', () => {
    it('clears the dock badge on macOS', () => {
      const originalPlatform = process.platform
      Object.defineProperty(process, 'platform', { value: 'darwin' })

      clearDockBadge()

      expect(app.dock.setBadge).toHaveBeenCalledWith('')

      Object.defineProperty(process, 'platform', { value: originalPlatform })
    })

    it('does not clear dock badge on Windows', () => {
      const originalPlatform = process.platform
      Object.defineProperty(process, 'platform', { value: 'win32' })

      clearDockBadge()

      expect(app.dock.setBadge).not.toHaveBeenCalled()

      Object.defineProperty(process, 'platform', { value: originalPlatform })
    })
  })

  describe('showCountdownProgress', () => {
    it('sets progress bar on Windows', () => {
      const originalPlatform = process.platform
      Object.defineProperty(process, 'platform', { value: 'win32' })

      const mockWindow = createMockWindow()
      const state: CountdownState = { totalSeconds: 3, secondsRemaining: 3 }

      showCountdownProgress(state, mockWindow as any)

      expect(mockWindow.setProgressBar).toHaveBeenCalledWith(1)

      Object.defineProperty(process, 'platform', { value: originalPlatform })
    })

    it('sets dock badge on macOS', () => {
      const originalPlatform = process.platform
      Object.defineProperty(process, 'platform', { value: 'darwin' })

      const mockWindow = createMockWindow()
      const state: CountdownState = { totalSeconds: 3, secondsRemaining: 3 }

      showCountdownProgress(state, mockWindow as any)

      expect(app.dock.setBadge).toHaveBeenCalledWith('3')

      Object.defineProperty(process, 'platform', { value: originalPlatform })
    })

    it('handles null window gracefully', () => {
      const state: CountdownState = { totalSeconds: 3, secondsRemaining: 3 }

      // Should not throw
      expect(() => showCountdownProgress(state, null)).not.toThrow()
    })
  })

  describe('updateCountdownProgress', () => {
    it('updates progress bar on Windows', () => {
      const originalPlatform = process.platform
      Object.defineProperty(process, 'platform', { value: 'win32' })

      const mockWindow = createMockWindow()
      const state: CountdownState = { totalSeconds: 3, secondsRemaining: 2 }

      updateCountdownProgress(state, mockWindow as any)

      expect(mockWindow.setProgressBar).toHaveBeenCalled()

      Object.defineProperty(process, 'platform', { value: originalPlatform })
    })

    it('updates dock badge on macOS', () => {
      const originalPlatform = process.platform
      Object.defineProperty(process, 'platform', { value: 'darwin' })

      const mockWindow = createMockWindow()
      const state: CountdownState = { totalSeconds: 3, secondsRemaining: 2 }

      updateCountdownProgress(state, mockWindow as any)

      expect(app.dock.setBadge).toHaveBeenCalledWith('2')

      Object.defineProperty(process, 'platform', { value: originalPlatform })
    })

    it('handles null window gracefully', () => {
      const state: CountdownState = { totalSeconds: 3, secondsRemaining: 2 }

      // Should not throw
      expect(() => updateCountdownProgress(state, null)).not.toThrow()
    })
  })

  describe('clearCountdownProgress', () => {
    it('clears progress bar on Windows', () => {
      const originalPlatform = process.platform
      Object.defineProperty(process, 'platform', { value: 'win32' })

      const mockWindow = createMockWindow()

      clearCountdownProgress(mockWindow as any)

      expect(mockWindow.setProgressBar).toHaveBeenCalledWith(-1)

      Object.defineProperty(process, 'platform', { value: originalPlatform })
    })

    it('clears dock badge on macOS', () => {
      const originalPlatform = process.platform
      Object.defineProperty(process, 'platform', { value: 'darwin' })

      const mockWindow = createMockWindow()

      clearCountdownProgress(mockWindow as any)

      expect(app.dock.setBadge).toHaveBeenCalledWith('')

      Object.defineProperty(process, 'platform', { value: originalPlatform })
    })

    it('handles null window gracefully', () => {
      // Should not throw
      expect(() => clearCountdownProgress(null)).not.toThrow()
    })
  })
})
