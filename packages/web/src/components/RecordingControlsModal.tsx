import { useState } from 'react'
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

type ConfirmationType = 'restart' | 'cancel' | null

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
  const [confirmationType, setConfirmationType] = useState<ConfirmationType>(null)

  if (!open) return null

  const handleRestartClick = () => {
    setConfirmationType('restart')
  }

  const handleCancelClick = () => {
    setConfirmationType('cancel')
  }

  const handleConfirm = () => {
    if (confirmationType === 'restart') {
      onRestart()
    } else if (confirmationType === 'cancel') {
      onCancel()
    }
    setConfirmationType(null)
  }

  const handleGoBack = () => {
    setConfirmationType(null)
  }

  const isPaused = recorderState === 'paused'

  return (
    <Box data-testid="recording-controls-modal" sx={{ p: 2 }}>
      {/* Timer and State Indicator */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <RecordingTimer getElapsedTime={getElapsedTime} />
        <Typography
          data-testid="state-indicator"
          sx={{
            color: isPaused ? 'warning.main' : 'error.main',
            fontWeight: 'bold',
          }}
        >
          {isPaused ? 'Paused' : 'Recording'}
        </Typography>
      </Box>

      {/* Control Buttons */}
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <Button variant="contained" color="error" onClick={onStop}>
          Stop
        </Button>
        {isPaused ? (
          <Button variant="outlined" onClick={onResume}>
            Resume
          </Button>
        ) : (
          <Button variant="outlined" onClick={onPause}>
            Pause
          </Button>
        )}
        <Button variant="outlined" onClick={handleRestartClick}>
          Restart
        </Button>
        <Button variant="outlined" onClick={handleCancelClick}>
          Cancel
        </Button>
      </Box>

      {/* Confirmation Dialog */}
      {confirmationType && (
        <Box
          data-testid="confirmation-dialog"
          sx={{
            mt: 2,
            p: 2,
            border: 1,
            borderColor: 'divider',
            borderRadius: 1,
          }}
        >
          <Typography sx={{ mb: 2 }}>
            This will discard your current recording. Are you sure?
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="outlined" onClick={handleGoBack}>
              Go back
            </Button>
            <Button variant="contained" color="warning" onClick={handleConfirm}>
              Confirm
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  )
}
