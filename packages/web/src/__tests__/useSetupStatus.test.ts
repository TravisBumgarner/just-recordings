import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { useSetupStatus } from '../hooks/useSetupStatus'

describe('useSetupStatus', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('initial state', () => {
    it('returns isSetupComplete as false when localStorage has no value', () => {
      const { result } = renderHook(() => useSetupStatus())

      expect(result.current.isSetupComplete).toBe(false)
    })

    it('returns isSetupComplete as true when localStorage has setup complete flag', () => {
      localStorage.setItem('just-recordings-setup-complete', 'true')

      const { result } = renderHook(() => useSetupStatus())

      expect(result.current.isSetupComplete).toBe(true)
    })
  })

  describe('markSetupComplete', () => {
    it('sets isSetupComplete to true', () => {
      const { result } = renderHook(() => useSetupStatus())

      expect(result.current.isSetupComplete).toBe(false)

      act(() => {
        result.current.markSetupComplete()
      })

      expect(result.current.isSetupComplete).toBe(true)
    })

    it('persists the setup complete flag to localStorage', () => {
      const { result } = renderHook(() => useSetupStatus())

      act(() => {
        result.current.markSetupComplete()
      })

      expect(localStorage.getItem('just-recordings-setup-complete')).toBe('true')
    })
  })
})
