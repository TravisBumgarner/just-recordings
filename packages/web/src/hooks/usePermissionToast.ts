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
  const [toast, setToast] = useState<ToastState | null>(null)

  const showToast = useCallback(
    (options: {
      message: string
      variant?: ToastVariant
      actionLabel?: string
      onAction?: () => void
    }) => {
      setToast({
        isOpen: true,
        message: options.message,
        variant: options.variant ?? 'warning',
        actionLabel: options.actionLabel,
        onAction: options.onAction,
      })
    },
    [],
  )

  const dismissToast = useCallback(() => {
    setToast(null)
  }, [])

  return {
    toast,
    showToast,
    dismissToast,
  }
}
