import { useState, useCallback } from 'react'
import type { ToastVariant } from '../components/PermissionToast'

export interface ToastState {
  isOpen: boolean
  message: string
  variant: ToastVariant
  actionLabel?: string
  onAction?: () => void
}

export interface UsePermissionToastReturn {
  toast: ToastState | null
  showToast: (options: {
    message: string
    variant?: ToastVariant
    actionLabel?: string
    onAction?: () => void
  }) => void
  dismissToast: () => void
}

export function usePermissionToast(): UsePermissionToastReturn {
  // Stub implementation
  return {
    toast: null,
    showToast: () => {},
    dismissToast: () => {},
  }
}
