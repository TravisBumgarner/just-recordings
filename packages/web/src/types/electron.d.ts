/**
 * Type declarations for Electron's preload script API.
 * These are exposed via contextBridge when running in Electron.
 */
declare global {
  interface Window {
    api?: {
      setRecordingState: (isRecording: boolean) => void
      setSetupMode: (enabled: boolean) => void
      getVersions: () => { electron: string; chrome: string; node: string }
      openExternal: (url: string) => void
      openSystemPreferences: (panel: 'screenRecording' | 'microphone' | 'camera') => void
    }
  }
}

export {}
