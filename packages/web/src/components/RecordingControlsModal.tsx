import { Box, Button, Typography } from '@mui/material'
import type { RecorderState } from '@just-recordings/recorder'
import { RecordingTimer } from './RecordingTimer'

export interface RecordingControlsModalProps {
  /** Whether the modal is open */
  open: boolean
  /** Current recorder state ('recording' | 'paused') */
  recorderState: RecorderState
  /** Function that returns elapsed time in milliseconds */
  getElapsedTime: () => number
  /** Called when stop button is clicked */
  onStop: () => void
  /** Called when pause button is clicked (when recording) */
  onPause: () => void
  /** Called when resume button is clicked (when paused) */
  onResume: () => void
  /** Called when restart is confirmed */
  onRestart: () => void
  /** Called when cancel is confirmed */
  onCancel: () => void
}

/**
 * Modal with recording controls accessible during an active recording.
 * Includes timer, state indicator, and buttons for stop, pause/resume,
 * restart, and cancel.
 */
export function RecordingControlsModal({
  open,
  recorderState,
  getElapsedTime,
  onStop,
  onPause,
  onResume,
  onRestart,
  onCancel,
}: RecordingControlsModalProps) {
  if (!open) return null

  return (
    <Box data-testid="recording-controls-modal">
      {/* TODO: Implement */}
    </Box>
  )
}
