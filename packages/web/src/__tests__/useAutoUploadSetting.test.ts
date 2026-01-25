import { renderHook, act } from '@testing-library/react'
import { describe, expect, it, beforeEach, afterEach } from 'vitest'
import { useAutoUploadSetting } from '../hooks/useAutoUploadSetting'

describe('useAutoUploadSetting', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('initial state', () => {
    it('returns autoUploadEnabled as true by default when localStorage has no value', () => {
      const { result } = renderHook(() => useAutoUploadSetting())

      expect(result.current.autoUploadEnabled).toBe(true)
    })

    it('returns autoUploadEnabled as true when localStorage value is "true"', () => {
      localStorage.setItem('just-recordings-auto-upload', 'true')

      const { result } = renderHook(() => useAutoUploadSetting())

      expect(result.current.autoUploadEnabled).toBe(true)
    })

    it('returns autoUploadEnabled as false when localStorage value is "false"', () => {
      localStorage.setItem('just-recordings-auto-upload', 'false')

      const { result } = renderHook(() => useAutoUploadSetting())

      expect(result.current.autoUploadEnabled).toBe(false)
    })
  })

  describe('setAutoUploadEnabled', () => {
    it('updates autoUploadEnabled state when called with false', () => {
      const { result } = renderHook(() => useAutoUploadSetting())

      act(() => {
        result.current.setAutoUploadEnabled(false)
      })

      expect(result.current.autoUploadEnabled).toBe(false)
    })

    it('updates autoUploadEnabled state when called with true', () => {
      localStorage.setItem('just-recordings-auto-upload', 'false')
      const { result } = renderHook(() => useAutoUploadSetting())

      act(() => {
        result.current.setAutoUploadEnabled(true)
      })

      expect(result.current.autoUploadEnabled).toBe(true)
    })

    it('persists the setting to localStorage when set to false', () => {
      const { result } = renderHook(() => useAutoUploadSetting())

      act(() => {
        result.current.setAutoUploadEnabled(false)
      })

      expect(localStorage.getItem('just-recordings-auto-upload')).toBe('false')
    })

    it('persists the setting to localStorage when set to true', () => {
      localStorage.setItem('just-recordings-auto-upload', 'false')
      const { result } = renderHook(() => useAutoUploadSetting())

      act(() => {
        result.current.setAutoUploadEnabled(true)
      })

      expect(localStorage.getItem('just-recordings-auto-upload')).toBe('true')
    })
  })
})
