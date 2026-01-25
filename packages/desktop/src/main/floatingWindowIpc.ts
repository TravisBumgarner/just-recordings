/**
 * IPC channel names for floating window communication
 */
export const FLOATING_WINDOW_CHANNELS = {
  // Main process commands
  SHOW: 'show-floating-controls',
  HIDE: 'hide-floating-controls',

  // State updates (main → floating)
  UPDATE_RECORDING_STATE: 'update-recording-state',

  // Control actions (floating → main)
  CONTROL_ACTION: 'floating-control-action',
} as const

/**
 * Recording state sent from main window to floating window
 */
export interface RecordingState {
  status: 'recording' | 'paused'
  elapsedTimeMs: number
  webcamEnabled: boolean
}

/**
 * Control actions that can be sent from floating window to main window
 */
export type FloatingControlAction = 'stop' | 'pause' | 'resume' | 'cancel'

const VALID_CONTROL_ACTIONS: readonly FloatingControlAction[] = [
  'stop',
  'pause',
  'resume',
  'cancel',
]

/**
 * Validates that a value is a valid FloatingControlAction
 */
export function isValidControlAction(action: unknown): action is FloatingControlAction {
  return (
    typeof action === 'string' && VALID_CONTROL_ACTIONS.includes(action as FloatingControlAction)
  )
}

/**
 * Creates a RecordingState object with default values
 */
export function createRecordingState(overrides: Partial<RecordingState> = {}): RecordingState {
  return {
    status: 'recording',
    elapsedTimeMs: 0,
    webcamEnabled: false,
    ...overrides,
  }
}
