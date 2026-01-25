/**
 * IPC channel names for countdown state communication
 */
export const COUNTDOWN_CHANNELS = {
  START: 'countdown:start',
  TICK: 'countdown:tick',
  END: 'countdown:end',
} as const

/**
 * Countdown state sent from renderer to main process
 */
export interface CountdownState {
  /** Total seconds in the countdown */
  totalSeconds: number
  /** Seconds remaining */
  secondsRemaining: number
}

/**
 * Creates a CountdownState object with default values
 */
export function createCountdownState(overrides: Partial<CountdownState> = {}): CountdownState {
  return {
    totalSeconds: 3,
    secondsRemaining: 3,
    ...overrides,
  }
}

/**
 * Validates that a value is a valid CountdownState
 */
export function isValidCountdownState(state: unknown): state is CountdownState {
  if (state === null || state === undefined || typeof state !== 'object') {
    return false
  }
  const obj = state as Record<string, unknown>
  return typeof obj.totalSeconds === 'number' && typeof obj.secondsRemaining === 'number'
}
