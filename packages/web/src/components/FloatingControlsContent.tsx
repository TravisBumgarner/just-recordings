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
  const isPaused = recordingState.status === 'paused'

  const handlePauseResume = () => {
    onAction(isPaused ? 'resume' : 'pause')
  }

  const handleStop = () => {
    onAction('stop')
  }

  const handleCancel = () => {
    onAction('cancel')
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
        <Button variant="outlined" size="small" onClick={handleCancel}>
          Cancel
        </Button>
      </Box>
    </Box>
  )
}
