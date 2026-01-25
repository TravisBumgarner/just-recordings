import { Box } from '@mui/material'
import type { RecordingState, FloatingControlAction } from '../pages/FloatingControls'

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
  // Stub implementation - to be completed in ralph-code phase
  void recordingState
  void onAction

  return (
    <Box data-testid="floating-controls-content">
      {/* Stub - will be implemented */}
    </Box>
  )
}
