import { Box } from '@mui/material'

export interface PermissionDeniedMessageProps {
  permission: 'screen' | 'microphone' | 'camera'
  onDismiss?: () => void
}

export function PermissionDeniedMessage({
  permission,
  onDismiss,
}: PermissionDeniedMessageProps) {
  // Stub implementation
  return (
    <Box data-testid="permission-denied-message">
      {permission} denied
      {onDismiss && <button onClick={onDismiss}>Dismiss</button>}
    </Box>
  )
}
