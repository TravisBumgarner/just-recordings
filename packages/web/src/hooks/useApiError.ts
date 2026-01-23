import type { ApiResponse } from '@just-recordings/shared'

export interface UseApiErrorResult {
  errorMessage: string | null
  isOpen: boolean
  handleResponse: <T>(response: ApiResponse<T>) => boolean
  clearError: () => void
}

export function useApiError(): UseApiErrorResult {
  // Stub implementation
  return {
    errorMessage: null,
    isOpen: false,
    handleResponse: () => false,
    clearError: () => {},
  }
}
