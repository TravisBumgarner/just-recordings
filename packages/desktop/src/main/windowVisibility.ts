import { BrowserWindow } from 'electron'

// Internal state to track if window is hidden for countdown/recording
let windowHiddenForRecording = false

/**
 * Hides the main window when countdown starts.
 * The window should remain hidden during recording.
 */
export function hideWindowForCountdown(mainWindow: BrowserWindow | null): void {
  if (mainWindow) {
    mainWindow.hide()
  }
  windowHiddenForRecording = true
}

/**
 * Shows the main window when recording stops.
 * Focuses the window to bring it to the front.
 */
export function showWindowAfterRecording(mainWindow: BrowserWindow | null): void {
  windowHiddenForRecording = false
  if (mainWindow) {
    mainWindow.show()
    mainWindow.focus()
  }
}

/**
 * Checks if the window is currently hidden for countdown/recording.
 */
export function isWindowHiddenForRecording(): boolean {
  return windowHiddenForRecording
}

/**
 * Sets the internal state tracking whether window is hidden for recording.
 * This prevents the blur handler from re-hiding the window when we show it.
 */
export function setWindowHiddenForRecording(hidden: boolean): void {
  windowHiddenForRecording = hidden
}
