/**
 * Utilities for detecting and interacting with Electron environment.
 */

/**
 * Check if the app is running inside Electron.
 * Returns true if window.api is available (exposed by Electron's preload script).
 */
export function isElectronCheck(): boolean {
  return typeof window !== 'undefined' && typeof window.api !== 'undefined'
}

/**
 * Notify Electron's main process about recording state changes.
 * No-op when not running in Electron.
 */
export function setRecordingState(isRecording: boolean): void {
  window.api?.setRecordingState(isRecording)
}
