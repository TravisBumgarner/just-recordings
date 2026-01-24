import { Alert, Button, IconButton } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'

export type ToastVariant = 'error' | 'warning'

export interface PermissionToastProps {
  message: string
  variant?: ToastVariant
  onDismiss: () => void
  actionLabel?: string
  onAction?: () => void
}

export function PermissionToast({
  message,
  variant = 'warning',
  onDismiss,
  actionLabel,
  onAction,
}: PermissionToastProps) {
  // Stub implementation
  return null
}
