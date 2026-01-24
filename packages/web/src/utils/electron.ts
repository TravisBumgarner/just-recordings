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

/**
 * Enable or disable setup mode in Electron's main process.
 * When setup mode is enabled, the window won't auto-hide on blur.
 * No-op when not running in Electron.
 */
export function setSetupMode(enabled: boolean): void {
  window.api?.setSetupMode(enabled)
}

/**
 * Open a URL in the user's default external browser.
 * No-op when not running in Electron.
 */
export function openExternal(url: string): void {
  window.api?.openExternal(url)
}
