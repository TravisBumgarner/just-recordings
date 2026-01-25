import { app, BrowserWindow } from 'electron'
import type { CountdownState } from './countdownIpc'

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
  // Stub - will be implemented
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
  // Stub - will be implemented
}

/**
 * Clears the countdown progress from the taskbar/dock.
 *
 * - Windows: Removes the progress bar
 * - macOS: Clears the dock badge
 */
export function clearCountdownProgress(mainWindow: BrowserWindow | null): void {
  // Stub - will be implemented
}

/**
 * Sets the dock badge on macOS. No-op on other platforms.
 */
export function setDockBadge(text: string): void {
  // Stub - will be implemented
}

/**
 * Clears the dock badge on macOS. No-op on other platforms.
 */
export function clearDockBadge(): void {
  // Stub - will be implemented
}

/**
 * Calculates the progress value (0-1) for the taskbar progress bar.
 * Returns the fraction of countdown remaining.
 */
export function calculateProgress(state: CountdownState): number {
  // Stub - will be implemented
  return 0
}
