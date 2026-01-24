import { Box, CircularProgress, Typography } from '@mui/material'

export type PermissionTestState = 'idle' | 'testing' | 'success' | 'failed'

export interface PermissionTestResultProps {
  state: PermissionTestState
  successMessage?: string
  failedMessage?: string
}

export function PermissionTestResult({
  state,
  successMessage = 'Permission granted',
  failedMessage = 'Permission denied',
}: PermissionTestResultProps) {
  // Stub - return null for now
  return null
}
