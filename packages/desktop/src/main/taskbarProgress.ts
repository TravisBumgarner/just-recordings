import { app, BrowserWindow } from 'electron'
import type { CountdownState } from './countdownIpc'

/**
 * Calculates the progress value (0-1) for the taskbar progress bar.
 * Returns the fraction of countdown remaining.
 */
export function calculateProgress(state: CountdownState): number {
  if (state.totalSeconds === 0) {
    return 0
  }
  return state.secondsRemaining / state.totalSeconds
}

/**
 * Sets the dock badge on macOS. No-op on other platforms.
 */
export function setDockBadge(text: string): void {
  if (process.platform === 'darwin') {
    app.dock.setBadge(text)
  }
}

/**
 * Clears the dock badge on macOS. No-op on other platforms.
 */
export function clearDockBadge(): void {
  if (process.platform === 'darwin') {
    app.dock.setBadge('')
  }
}

/**
 * Shows countdown progress in the system taskbar (Windows) or dock (macOS).
 *
 * - Windows: Shows a progress bar in the taskbar
 * - macOS: Shows a badge with the seconds remaining
 */
export function showCountdownProgress(
  state: CountdownState,
  mainWindow: BrowserWindow | null,
): void {
  if (process.platform === 'darwin') {
    setDockBadge(String(state.secondsRemaining))
  } else if (process.platform === 'win32') {
    if (mainWindow) {
      mainWindow.setProgressBar(calculateProgress(state))
    }
  }
}

/**
 * Updates the countdown progress display.
 *
 * - Windows: Updates the progress bar based on seconds remaining
 * - macOS: Updates the dock badge with the seconds remaining
 */
export function updateCountdownProgress(
  state: CountdownState,
  mainWindow: BrowserWindow | null,
): void {
  if (process.platform === 'darwin') {
    setDockBadge(String(state.secondsRemaining))
  } else if (process.platform === 'win32') {
    if (mainWindow) {
      mainWindow.setProgressBar(calculateProgress(state))
    }
  }
}

/**
 * Clears the countdown progress from the taskbar/dock.
 *
 * - Windows: Removes the progress bar (setProgressBar(-1) removes it)
 * - macOS: Clears the dock badge
 */
export function clearCountdownProgress(mainWindow: BrowserWindow | null): void {
  if (process.platform === 'darwin') {
    clearDockBadge()
  } else if (process.platform === 'win32') {
    if (mainWindow) {
      mainWindow.setProgressBar(-1)
    }
  }
}
