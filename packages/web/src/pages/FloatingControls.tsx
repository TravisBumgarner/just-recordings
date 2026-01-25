import { useCallback, useEffect, useState } from 'react'
import { Box, Typography } from '@mui/material'

/**
 * Recording state received from the main window via IPC
 */
export interface RecordingState {
  status: 'recording' | 'paused'
  elapsedTimeMs: number
  webcamEnabled: boolean
}

/**
 * Control actions that can be sent to the main window
 */
export type FloatingControlAction = 'stop' | 'pause' | 'resume' | 'cancel'

/**
 * Props for the FloatingControls component
 */
export interface FloatingControlsProps {
  /**
   * Optional initial state for testing
   */
  initialState?: RecordingState
}

/**
 * FloatingControls page component rendered in the floating window.
 * Listens for recording state updates via IPC and allows sending control actions.
 */
function FloatingControls({ initialState }: FloatingControlsProps) {
  const [recordingState, setRecordingState] = useState<RecordingState | null>(
    initialState ?? null,
  )

  // Subscribe to recording state updates from main window
  useEffect(() => {
    // Stub - will be implemented
    return () => {}
  }, [])

  // Handler to send control actions to main window
  const sendControlAction = useCallback((_action: FloatingControlAction) => {
    // Stub - will be implemented
  }, [])

  if (!recordingState) {
    return (
      <Box data-testid="floating-controls-loading">
        <Typography>Waiting for recording state...</Typography>
      </Box>
    )
  }

  return (
    <Box data-testid="floating-controls">
      <Typography data-testid="recording-status">
        {recordingState.status === 'recording' ? 'Recording' : 'Paused'}
      </Typography>
      <Typography data-testid="elapsed-time">{recordingState.elapsedTimeMs}</Typography>
      {/* Controls will be added in Task 4 */}
    </Box>
  )
}

export default FloatingControls
