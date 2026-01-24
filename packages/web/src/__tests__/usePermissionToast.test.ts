import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { usePermissionToast } from '../hooks/usePermissionToast'

describe('usePermissionToast', () => {
  describe('initial state', () => {
    it('starts with no toast visible', () => {
      const { result } = renderHook(() => usePermissionToast())

      expect(result.current.toast).toBeNull()
    })
  })

  describe('showToast', () => {
    it('shows toast with provided message', () => {
      const { result } = renderHook(() => usePermissionToast())

      act(() => {
        result.current.showToast({ message: 'Permission denied' })
      })

      expect(result.current.toast).not.toBeNull()
      expect(result.current.toast?.message).toBe('Permission denied')
      expect(result.current.toast?.isOpen).toBe(true)
    })

    it('uses warning variant by default', () => {
      const { result } = renderHook(() => usePermissionToast())

      act(() => {
        result.current.showToast({ message: 'Test' })
      })

      expect(result.current.toast?.variant).toBe('warning')
    })

    it('uses provided variant', () => {
      const { result } = renderHook(() => usePermissionToast())

      act(() => {
        result.current.showToast({ message: 'Test', variant: 'error' })
      })

      expect(result.current.toast?.variant).toBe('error')
    })

    it('includes action details when provided', () => {
      const { result } = renderHook(() => usePermissionToast())
      const onAction = vi.fn()

      act(() => {
        result.current.showToast({
          message: 'Test',
          actionLabel: 'Open Settings',
          onAction,
        })
      })

      expect(result.current.toast?.actionLabel).toBe('Open Settings')
      expect(result.current.toast?.onAction).toBe(onAction)
    })
  })

  describe('dismissToast', () => {
    it('clears the toast', () => {
      const { result } = renderHook(() => usePermissionToast())

      act(() => {
        result.current.showToast({ message: 'Test' })
      })
      expect(result.current.toast).not.toBeNull()

      act(() => {
        result.current.dismissToast()
      })

      expect(result.current.toast).toBeNull()
    })
  })
})
