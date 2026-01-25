/**
 * Utilities for detecting and interacting with Electron environment.
 */

import type { CountdownState } from '../types/electron'

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

/**
 * Notify Electron's main process that countdown has started.
 * No-op when not running in Electron.
 */
export function countdownStart(state: CountdownState): void {
  window.api?.countdownStart(state)
}

/**
 * Notify Electron's main process of countdown tick.
 * No-op when not running in Electron.
 */
export function countdownTick(state: CountdownState): void {
  window.api?.countdownTick(state)
}

/**
 * Notify Electron's main process that countdown has ended.
 * No-op when not running in Electron.
 */
export function countdownEnd(): void {
  window.api?.countdownEnd()
}
