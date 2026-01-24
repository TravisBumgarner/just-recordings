import { Box, Typography } from '@mui/material'

export interface CountdownOverlayProps {
  /** Starting countdown value in seconds */
  seconds: number
  /** Called when countdown reaches 0 */
  onComplete: () => void
}

/**
 * Visual countdown overlay that displays before recording starts.
 * Shows large centered numbers counting down from the provided seconds value.
 */
export function CountdownOverlay({ seconds, onComplete }: CountdownOverlayProps) {
  // Stub implementation
  return (
    <Box data-testid="countdown-overlay">
      <Typography variant="h1">{seconds}</Typography>
    </Box>
  )
}
