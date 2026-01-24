import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getSystemPreferencesUrl, isSystemPreferencesSupported } from '../systemPreferences'

describe('systemPreferences', () => {
  const originalPlatform = process.platform

  beforeEach(() => {
    vi.resetModules()
  })

  afterEach(() => {
    Object.defineProperty(process, 'platform', { value: originalPlatform })
  })

  describe('getSystemPreferencesUrl', () => {
    describe('on macOS', () => {
      beforeEach(() => {
        Object.defineProperty(process, 'platform', { value: 'darwin' })
      })

      it('returns Screen Recording privacy panel URL', () => {
        const url = getSystemPreferencesUrl('screenRecording')

        expect(url).toBe(
          'x-apple.systempreferences:com.apple.preference.security?Privacy_ScreenCapture',
        )
      })

      it('returns Microphone privacy panel URL', () => {
        const url = getSystemPreferencesUrl('microphone')

        expect(url).toBe(
          'x-apple.systempreferences:com.apple.preference.security?Privacy_Microphone',
        )
      })

      it('returns Camera privacy panel URL', () => {
        const url = getSystemPreferencesUrl('camera')

        expect(url).toBe('x-apple.systempreferences:com.apple.preference.security?Privacy_Camera')
      })
    })

    describe('on non-macOS platforms', () => {
      beforeEach(() => {
        Object.defineProperty(process, 'platform', { value: 'win32' })
      })

      it('returns null for screenRecording', () => {
        const url = getSystemPreferencesUrl('screenRecording')

        expect(url).toBeNull()
      })

      it('returns null for microphone', () => {
        const url = getSystemPreferencesUrl('microphone')

        expect(url).toBeNull()
      })

      it('returns null for camera', () => {
        const url = getSystemPreferencesUrl('camera')

        expect(url).toBeNull()
      })
    })
  })

  describe('isSystemPreferencesSupported', () => {
    it('returns true on macOS', () => {
      Object.defineProperty(process, 'platform', { value: 'darwin' })

      expect(isSystemPreferencesSupported()).toBe(true)
    })

    it('returns false on Windows', () => {
      Object.defineProperty(process, 'platform', { value: 'win32' })

      expect(isSystemPreferencesSupported()).toBe(false)
    })

    it('returns false on Linux', () => {
      Object.defineProperty(process, 'platform', { value: 'linux' })

      expect(isSystemPreferencesSupported()).toBe(false)
    })
  })
})
