import { useState } from 'react'
import { Box, Button, IconButton, Tooltip, Typography } from '@mui/material'
import { FaStop, FaPause, FaPlay, FaTimes, FaRedo, FaCircle } from 'react-icons/fa'
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
 * Includes timer, state indicator, and icon buttons for stop, pause/resume,
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              color: isPaused ? 'warning.main' : 'error.main',
              display: 'flex',
              alignItems: 'center',
              animation: isPaused ? 'none' : 'pulse 1.5s ease-in-out infinite',
              '@keyframes pulse': {
                '0%, 100%': { opacity: 1 },
                '50%': { opacity: 0.5 },
              },
            }}
          >
            <FaCircle size={12} />
          </Box>
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
      </Box>

      {/* Control Buttons with Icons */}
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
        <Tooltip title="Stop">
          <IconButton
            onClick={onStop}
            size="small"
            color="error"
            aria-label="stop"
            sx={{ bgcolor: 'error.main', color: 'white', '&:hover': { bgcolor: 'error.dark' } }}
          >
            <FaStop size={14} />
          </IconButton>
        </Tooltip>

        <Tooltip title={isPaused ? 'Resume' : 'Pause'}>
          <IconButton
            onClick={isPaused ? onResume : onPause}
            size="small"
            aria-label={isPaused ? 'resume' : 'pause'}
            sx={{ border: 1, borderColor: 'divider' }}
          >
            {isPaused ? <FaPlay size={14} /> : <FaPause size={14} />}
          </IconButton>
        </Tooltip>

        <Tooltip title="Restart">
          <IconButton
            onClick={handleRestartClick}
            size="small"
            aria-label="restart"
            sx={{ border: 1, borderColor: 'divider' }}
          >
            <FaRedo size={14} />
          </IconButton>
        </Tooltip>

        <Tooltip title="Cancel">
          <IconButton
            onClick={handleCancelClick}
            size="small"
            aria-label="cancel"
            sx={{ border: 1, borderColor: 'divider' }}
          >
            <FaTimes size={14} />
          </IconButton>
        </Tooltip>
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
