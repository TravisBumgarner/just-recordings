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
  // Idle state renders nothing
  if (state === 'idle') {
    return null
  }

  return (
    <Box
      data-testid="permission-test-result"
      data-state={state}
      aria-live="polite"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 1,
        mt: 1,
      }}
    >
      {state === 'testing' && (
        <>
          <CircularProgress size={16} aria-label="Testing permission" />
          <Typography variant="body2" color="text.secondary">
            Testing...
          </Typography>
        </>
      )}

      {state === 'success' && (
        <>
          <Typography
            component="span"
            sx={{ color: 'success.main', fontWeight: 'bold', fontSize: '1rem' }}
          >
            ✓
          </Typography>
          <Typography variant="body2" color="success.main">
            {successMessage}
          </Typography>
        </>
      )}

      {state === 'failed' && (
        <>
          <Typography
            component="span"
            sx={{ color: 'error.main', fontWeight: 'bold', fontSize: '1rem' }}
          >
            ✗
          </Typography>
          <Typography variant="body2" color="error.main">
            {failedMessage}
          </Typography>
        </>
      )}
    </Box>
  )
}
