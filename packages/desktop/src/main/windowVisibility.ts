import { BrowserWindow } from 'electron'

/**
 * Hides the main window when countdown starts.
 * The window should remain hidden during recording.
 */
export function hideWindowForCountdown(mainWindow: BrowserWindow | null): void {
  // Stub - will be implemented
}

/**
 * Shows the main window when recording stops.
 * Positions it near the tray if possible.
 */
export function showWindowAfterRecording(mainWindow: BrowserWindow | null): void {
  // Stub - will be implemented
}

/**
 * Checks if the window is currently hidden for countdown/recording.
 */
export function isWindowHiddenForRecording(): boolean {
  // Stub - will be implemented
  return false
}

/**
 * Sets the internal state tracking whether window is hidden for recording.
 * This prevents the blur handler from re-hiding the window when we show it.
 */
export function setWindowHiddenForRecording(hidden: boolean): void {
  // Stub - will be implemented
}
