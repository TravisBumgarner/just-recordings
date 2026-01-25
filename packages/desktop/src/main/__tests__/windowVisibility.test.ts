import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  hideWindowForCountdown,
  isWindowHiddenForRecording,
  setWindowHiddenForRecording,
  showWindowAfterRecording,
} from '../windowVisibility'

// Mock electron
vi.mock('electron', () => ({
  BrowserWindow: vi.fn(),
}))

describe('windowVisibility', () => {
  // Mock BrowserWindow instance
  const createMockWindow = () => ({
    hide: vi.fn(),
    show: vi.fn(),
    focus: vi.fn(),
    isVisible: vi.fn().mockReturnValue(true),
  })

  beforeEach(() => {
    vi.clearAllMocks()
    // Reset internal state
    setWindowHiddenForRecording(false)
  })

  describe('hideWindowForCountdown', () => {
    it('hides the window', () => {
      const mockWindow = createMockWindow()

      hideWindowForCountdown(mockWindow as any)

      expect(mockWindow.hide).toHaveBeenCalled()
    })

    it('sets hidden for recording state to true', () => {
      const mockWindow = createMockWindow()

      hideWindowForCountdown(mockWindow as any)

      expect(isWindowHiddenForRecording()).toBe(true)
    })

    it('handles null window gracefully', () => {
      expect(() => hideWindowForCountdown(null)).not.toThrow()
    })
  })

  describe('showWindowAfterRecording', () => {
    it('shows the window', () => {
      const mockWindow = createMockWindow()
      setWindowHiddenForRecording(true)

      showWindowAfterRecording(mockWindow as any)

      expect(mockWindow.show).toHaveBeenCalled()
    })

    it('focuses the window', () => {
      const mockWindow = createMockWindow()
      setWindowHiddenForRecording(true)

      showWindowAfterRecording(mockWindow as any)

      expect(mockWindow.focus).toHaveBeenCalled()
    })

    it('sets hidden for recording state to false', () => {
      setWindowHiddenForRecording(true)
      const mockWindow = createMockWindow()

      showWindowAfterRecording(mockWindow as any)

      expect(isWindowHiddenForRecording()).toBe(false)
    })

    it('handles null window gracefully', () => {
      expect(() => showWindowAfterRecording(null)).not.toThrow()
    })
  })

  describe('isWindowHiddenForRecording', () => {
    it('returns false by default', () => {
      expect(isWindowHiddenForRecording()).toBe(false)
    })

    it('returns true after hideWindowForCountdown is called', () => {
      const mockWindow = createMockWindow()
      hideWindowForCountdown(mockWindow as any)

      expect(isWindowHiddenForRecording()).toBe(true)
    })

    it('returns false after showWindowAfterRecording is called', () => {
      const mockWindow = createMockWindow()
      hideWindowForCountdown(mockWindow as any)
      showWindowAfterRecording(mockWindow as any)

      expect(isWindowHiddenForRecording()).toBe(false)
    })
  })

  describe('setWindowHiddenForRecording', () => {
    it('sets the hidden state to true', () => {
      setWindowHiddenForRecording(true)
      expect(isWindowHiddenForRecording()).toBe(true)
    })

    it('sets the hidden state to false', () => {
      setWindowHiddenForRecording(true)
      setWindowHiddenForRecording(false)
      expect(isWindowHiddenForRecording()).toBe(false)
    })
  })
})
