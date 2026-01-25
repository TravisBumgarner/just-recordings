import { describe, expect, it } from 'vitest'
import {
  FLOATING_WINDOW_DEFAULTS,
  getFloatingWindowHash,
  getFloatingWindowOptions,
  getFloatingWindowUrl,
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
})
