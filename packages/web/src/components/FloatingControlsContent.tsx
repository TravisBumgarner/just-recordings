import { useState } from 'react'
import { Box, Button, Typography } from '@mui/material'
import type { RecordingState, FloatingControlAction } from '../pages/FloatingControls'
import { formatTime } from './RecordingTimer'

export interface FloatingControlsContentProps {
  /** Current recording state */
  recordingState: RecordingState
  /** Callback to send control actions to main window */
  onAction: (action: FloatingControlAction) => void
}

/**
 * UI component for the floating controls window.
 * Displays recording state, elapsed time, and control buttons.
 * Includes a draggable titlebar area for window positioning.
 */
export function FloatingControlsContent({
  recordingState,
  onAction,
}: FloatingControlsContentProps) {
  const [showConfirmation, setShowConfirmation] = useState(false)

  const isPaused = recordingState.status === 'paused'

  const handlePauseResume = () => {
    onAction(isPaused ? 'resume' : 'pause')
  }

  const handleStop = () => {
    onAction('stop')
  }

  const handleCancelClick = () => {
    setShowConfirmation(true)
  }

  const handleConfirmCancel = () => {
    onAction('cancel')
    setShowConfirmation(false)
  }

  const handleGoBack = () => {
    setShowConfirmation(false)
  }

  return (
    <Box data-testid="floating-controls-content">
      {/* Draggable titlebar area */}
      <Box
        data-testid="titlebar"
        sx={{
          height: 24,
          cursor: 'move',
        }}
        style={{
          // @ts-expect-error - WebkitAppRegion is Electron-specific CSS property for window dragging
          WebkitAppRegion: 'drag',
        }}
      />

      {/* State indicator and elapsed time */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1, px: 1 }}>
        <Typography
          data-testid="state-indicator"
          sx={{
            color: isPaused ? 'warning.main' : 'error.main',
            fontWeight: 'bold',
          }}
        >
          {isPaused ? 'Paused' : 'Recording'}
        </Typography>
        <Typography data-testid="elapsed-time" variant="h6" component="span">
          {formatTime(recordingState.elapsedTimeMs)}
        </Typography>
      </Box>

      {/* Control buttons */}
      <Box sx={{ display: 'flex', gap: 1, px: 1 }}>
        <Button variant="contained" color="error" size="small" onClick={handleStop}>
          Stop
        </Button>
        <Button variant="outlined" size="small" onClick={handlePauseResume}>
          {isPaused ? 'Resume' : 'Pause'}
        </Button>
        <Button variant="outlined" size="small" onClick={handleCancelClick}>
          Cancel
        </Button>
      </Box>

      {/* Confirmation dialog for cancel */}
      {showConfirmation && (
        <Box
          data-testid="confirmation-dialog"
          sx={{
            mt: 1,
            p: 1,
            border: 1,
            borderColor: 'divider',
            borderRadius: 1,
            mx: 1,
          }}
        >
          <Typography variant="body2" sx={{ mb: 1 }}>
            Discard this recording?
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="outlined" size="small" onClick={handleGoBack}>
              Go back
            </Button>
            <Button variant="contained" color="warning" size="small" onClick={handleConfirmCancel}>
              Confirm
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  )
}
