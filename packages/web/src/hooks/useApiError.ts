import { useCallback, useEffect, useRef, useState } from 'react'
import { type ApiResponse, errorMessages } from '@just-recordings/shared'

export interface UseApiErrorResult {
  errorMessage: string | null
  isOpen: boolean
  handleResponse: <T>(response: ApiResponse<T>) => boolean
  clearError: () => void
}

const AUTO_DISMISS_MS = 6000

export function useApiError(): UseApiErrorResult {
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearError = useCallback(() => {
    setIsOpen(false)
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  const handleResponse = useCallback(
    <T>(response: ApiResponse<T>): boolean => {
      if (response.success) {
        return true
      }

      // Set error message from errorMessages map
      const message = errorMessages[response.errorCode]
      setErrorMessage(message)
      setIsOpen(true)

      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      // Set auto-dismiss timeout
      timeoutRef.current = setTimeout(() => {
        setIsOpen(false)
      }, AUTO_DISMISS_MS)

      return false
    },
    []
  )

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return {
    errorMessage,
    isOpen,
    handleResponse,
    clearError,
  }
}
