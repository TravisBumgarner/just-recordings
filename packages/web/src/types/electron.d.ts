/**
 * Type declarations for Electron's preload script API.
 * These are exposed via contextBridge when running in Electron.
 */

/** Countdown state for IPC messages */
export interface CountdownState {
  totalSeconds: number
  secondsRemaining: number
}

declare global {
  interface Window {
    api?: {
      setRecordingState: (isRecording: boolean) => void
      setSetupMode: (enabled: boolean) => void
      getVersions: () => { electron: string; chrome: string; node: string }
      openExternal: (url: string) => void
      openSystemPreferences: (panel: 'screenRecording' | 'microphone' | 'camera') => void
      // Countdown IPC APIs
      countdownStart: (state: CountdownState) => void
      countdownTick: (state: CountdownState) => void
      countdownEnd: () => void
    }
  }
}

export {}
