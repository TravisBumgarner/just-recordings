import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ApiFailure, ApiSuccess } from '@just-recordings/shared'
import { useApiError } from '../hooks/useApiError'

describe('useApiError', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('initial state', () => {
    it('starts with no error message', () => {
      const { result } = renderHook(() => useApiError())

      expect(result.current.errorMessage).toBeNull()
      expect(result.current.isOpen).toBe(false)
    })
  })

  describe('handleResponse', () => {
    it('returns true for successful response', () => {
      const { result } = renderHook(() => useApiError())
      const successResponse: ApiSuccess<{ data: string }> = {
        success: true,
        data: { data: 'test' },
      }

      let returnValue: boolean
      act(() => {
        returnValue = result.current.handleResponse(successResponse)
      })

      expect(returnValue!).toBe(true)
      expect(result.current.errorMessage).toBeNull()
      expect(result.current.isOpen).toBe(false)
    })

    it('returns false and sets error message for failed response', () => {
      const { result } = renderHook(() => useApiError())
      const failureResponse: ApiFailure = {
        success: false,
        errorCode: 'UNAUTHORIZED',
      }

      let returnValue: boolean
      act(() => {
        returnValue = result.current.handleResponse(failureResponse)
      })

      expect(returnValue!).toBe(false)
      expect(result.current.errorMessage).toBe('Please sign in to continue')
      expect(result.current.isOpen).toBe(true)
    })

    it('maps RECORDING_NOT_FOUND to correct message', () => {
      const { result } = renderHook(() => useApiError())
      const failureResponse: ApiFailure = {
        success: false,
        errorCode: 'RECORDING_NOT_FOUND',
      }

      act(() => {
        result.current.handleResponse(failureResponse)
      })

      expect(result.current.errorMessage).toBe('Recording not found')
    })
  })

  describe('clearError', () => {
    it('clears the error message and closes alert', () => {
      const { result } = renderHook(() => useApiError())

      // First set an error
      act(() => {
        result.current.handleResponse({ success: false, errorCode: 'FORBIDDEN' })
      })
      expect(result.current.isOpen).toBe(true)

      // Then clear it
      act(() => {
        result.current.clearError()
      })

      expect(result.current.isOpen).toBe(false)
    })
  })

  describe('auto-dismiss', () => {
    it('auto-dismisses after 6 seconds', () => {
      const { result } = renderHook(() => useApiError())

      act(() => {
        result.current.handleResponse({ success: false, errorCode: 'INTERNAL_ERROR' })
      })
      expect(result.current.isOpen).toBe(true)

      // Advance timer by 6 seconds
      act(() => {
        vi.advanceTimersByTime(6000)
      })

      expect(result.current.isOpen).toBe(false)
    })
  })
})
