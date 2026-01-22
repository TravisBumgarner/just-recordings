/**
 * Utilities for detecting and interacting with Electron environment.
 */

/**
 * Check if the app is running inside Electron.
 * Returns true if window.api is available (exposed by Electron's preload script).
 */
export function isElectron(): boolean {
  // Stub - will be implemented
  return false
}

/**
 * Notify Electron's main process about recording state changes.
 * No-op when not running in Electron.
 */
export function setRecordingState(isRecording: boolean): void {
  // Stub - will be implemented
}
