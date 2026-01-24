import { Alert, Button, IconButton } from '@mui/material'

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
  return (
    <Alert
      severity={variant}
      action={
        <>
          {actionLabel && onAction && (
            <Button color="inherit" size="small" onClick={onAction}>
              {actionLabel}
            </Button>
          )}
          <IconButton
            aria-label="close"
            color="inherit"
            size="small"
            onClick={onDismiss}
          >
            ✕
          </IconButton>
        </>
      }
    >
      {message}
    </Alert>
  )
}
