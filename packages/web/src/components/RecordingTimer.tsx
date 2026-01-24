import { Typography } from '@mui/material'

export interface RecordingTimerProps {
  /** Function that returns elapsed time in milliseconds */
  getElapsedTime: () => number
  /** Update interval in milliseconds (default: 100ms for smooth updates) */
  updateInterval?: number
}

/**
 * Formats milliseconds into MM:SS or HH:MM:SS format
 */
export function formatTime(ms: number): string {
  // Stub - will be implemented
  return '00:00'
}

/**
 * Component that displays elapsed recording time.
 * Polls getElapsedTime() and formats for display.
 */
export function RecordingTimer({ getElapsedTime, updateInterval = 100 }: RecordingTimerProps) {
  // Stub implementation
  return (
    <Typography variant="h6" component="span" data-testid="recording-timer">
      00:00
    </Typography>
  )
}
