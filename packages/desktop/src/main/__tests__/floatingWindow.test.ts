import { describe, expect, it, vi } from 'vitest'
import {
  FLOATING_WINDOW_DEFAULTS,
  FLOATING_WINDOW_STORAGE_KEY,
  getFloatingWindowHash,
  getFloatingWindowOptions,
  getFloatingWindowOptionsWithBounds,
  getFloatingWindowUrl,
  loadFloatingWindowBounds,
  saveFloatingWindowBounds,
  validateWindowBounds,
} from '../floatingWindow'

describe('floatingWindow', () => {
  describe('FLOATING_WINDOW_DEFAULTS', () => {
    it('has width of 300', () => {
      expect(FLOATING_WINDOW_DEFAULTS.width).toBe(300)
    })

    it('has height of 200', () => {
      expect(FLOATING_WINDOW_DEFAULTS.height).toBe(200)
    })

    it('has minWidth of 200', () => {
      expect(FLOATING_WINDOW_DEFAULTS.minWidth).toBe(200)
    })

    it('has minHeight of 150', () => {
      expect(FLOATING_WINDOW_DEFAULTS.minHeight).toBe(150)
    })
  })

  describe('getFloatingWindowOptions', () => {
    const preloadPath = '/path/to/preload.js'

    it('returns options with correct default dimensions', () => {
      const options = getFloatingWindowOptions(preloadPath)

      expect(options.width).toBe(300)
      expect(options.height).toBe(200)
    })

    it('returns options with correct minimum dimensions', () => {
      const options = getFloatingWindowOptions(preloadPath)

      expect(options.minWidth).toBe(200)
      expect(options.minHeight).toBe(150)
    })

    it('returns frameless window option', () => {
      const options = getFloatingWindowOptions(preloadPath)

      expect(options.frame).toBe(false)
    })

    it('returns transparent window option', () => {
      const options = getFloatingWindowOptions(preloadPath)

      expect(options.transparent).toBe(true)
    })

    it('returns alwaysOnTop option as true', () => {
      const options = getFloatingWindowOptions(preloadPath)

      expect(options.alwaysOnTop).toBe(true)
    })

    it('returns skipTaskbar option as true', () => {
      const options = getFloatingWindowOptions(preloadPath)

      expect(options.skipTaskbar).toBe(true)
    })

    it('returns resizable option as true', () => {
      const options = getFloatingWindowOptions(preloadPath)

      expect(options.resizable).toBe(true)
    })

    it('returns show option as false (window starts hidden)', () => {
      const options = getFloatingWindowOptions(preloadPath)

      expect(options.show).toBe(false)
    })

    it('sets preload path in webPreferences', () => {
      const options = getFloatingWindowOptions(preloadPath)

      expect(options.webPreferences?.preload).toBe(preloadPath)
    })
  })

  describe('getFloatingWindowUrl', () => {
    it('returns localhost URL with /floating-controls route in dev mode', () => {
      const url = getFloatingWindowUrl(true)

      expect(url).toBe('http://localhost:5173/floating-controls')
    })

    it('returns empty string in production (uses loadFile instead)', () => {
      const url = getFloatingWindowUrl(false)

      expect(url).toBe('')
    })
  })

  describe('getFloatingWindowHash', () => {
    it('returns /floating-controls hash for production routing', () => {
      const hash = getFloatingWindowHash()

      expect(hash).toBe('/floating-controls')
    })
  })

  describe('saveFloatingWindowBounds', () => {
    it('saves bounds to storage with correct key', () => {
      const bounds = { x: 100, y: 200, width: 300, height: 200 }
      const storage = { setItem: vi.fn() }

      saveFloatingWindowBounds(bounds, storage)

      expect(storage.setItem).toHaveBeenCalledWith(
        FLOATING_WINDOW_STORAGE_KEY,
        JSON.stringify(bounds),
      )
    })
  })

  describe('loadFloatingWindowBounds', () => {
    it('returns null when no saved bounds exist', () => {
      const storage = { getItem: vi.fn().mockReturnValue(null) }

      const result = loadFloatingWindowBounds(storage)

      expect(result).toBeNull()
    })

    it('returns parsed bounds when valid JSON exists', () => {
      const savedBounds = { x: 100, y: 200, width: 300, height: 200 }
      const storage = { getItem: vi.fn().mockReturnValue(JSON.stringify(savedBounds)) }

      const result = loadFloatingWindowBounds(storage)

      expect(result).toEqual(savedBounds)
    })

    it('returns null when JSON parsing fails', () => {
      const storage = { getItem: vi.fn().mockReturnValue('invalid json') }

      const result = loadFloatingWindowBounds(storage)

      expect(result).toBeNull()
    })

    it('uses correct storage key', () => {
      const storage = { getItem: vi.fn().mockReturnValue(null) }

      loadFloatingWindowBounds(storage)

      expect(storage.getItem).toHaveBeenCalledWith(FLOATING_WINDOW_STORAGE_KEY)
    })
  })

  describe('validateWindowBounds', () => {
    const screenBounds = { x: 0, y: 0, width: 1920, height: 1080 }

    it('returns original bounds when fully within screen', () => {
      const bounds = { x: 100, y: 100, width: 300, height: 200 }

      const result = validateWindowBounds(bounds, screenBounds)

      expect(result).toEqual(bounds)
    })

    it('adjusts x position when window is off left edge', () => {
      const bounds = { x: -50, y: 100, width: 300, height: 200 }

      const result = validateWindowBounds(bounds, screenBounds)

      expect(result.x).toBe(0)
    })

    it('adjusts y position when window is off top edge', () => {
      const bounds = { x: 100, y: -50, width: 300, height: 200 }

      const result = validateWindowBounds(bounds, screenBounds)

      expect(result.y).toBe(0)
    })

    it('adjusts x position when window is off right edge', () => {
      const bounds = { x: 1800, y: 100, width: 300, height: 200 }

      const result = validateWindowBounds(bounds, screenBounds)

      expect(result.x).toBe(1620) // 1920 - 300
    })

    it('adjusts y position when window is off bottom edge', () => {
      const bounds = { x: 100, y: 950, width: 300, height: 200 }

      const result = validateWindowBounds(bounds, screenBounds)

      expect(result.y).toBe(880) // 1080 - 200
    })

    it('preserves size when adjusting position', () => {
      const bounds = { x: -50, y: -50, width: 300, height: 200 }

      const result = validateWindowBounds(bounds, screenBounds)

      expect(result.width).toBe(300)
      expect(result.height).toBe(200)
    })
  })

  describe('getFloatingWindowOptionsWithBounds', () => {
    const preloadPath = '/path/to/preload.js'
    const screenBounds = { x: 0, y: 0, width: 1920, height: 1080 }

    it('uses default dimensions when no saved bounds', () => {
      const options = getFloatingWindowOptionsWithBounds(preloadPath, null, screenBounds)

      expect(options.width).toBe(FLOATING_WINDOW_DEFAULTS.width)
      expect(options.height).toBe(FLOATING_WINDOW_DEFAULTS.height)
    })

    it('uses saved dimensions when available', () => {
      const savedBounds = { x: 100, y: 100, width: 400, height: 300 }

      const options = getFloatingWindowOptionsWithBounds(preloadPath, savedBounds, screenBounds)

      expect(options.width).toBe(400)
      expect(options.height).toBe(300)
    })

    it('uses saved position when available', () => {
      const savedBounds = { x: 100, y: 200, width: 300, height: 200 }

      const options = getFloatingWindowOptionsWithBounds(preloadPath, savedBounds, screenBounds)

      expect(options.x).toBe(100)
      expect(options.y).toBe(200)
    })

    it('validates bounds against screen before applying', () => {
      const offScreenBounds = { x: 2000, y: 100, width: 300, height: 200 }

      const options = getFloatingWindowOptionsWithBounds(
        preloadPath,
        offScreenBounds,
        screenBounds,
      )

      expect(options.x).toBe(1620) // Adjusted to fit screen
    })

    it('preserves other window options from defaults', () => {
      const savedBounds = { x: 100, y: 100, width: 400, height: 300 }

      const options = getFloatingWindowOptionsWithBounds(preloadPath, savedBounds, screenBounds)

      expect(options.alwaysOnTop).toBe(true)
      expect(options.frame).toBe(false)
      expect(options.transparent).toBe(true)
    })
  })
})
