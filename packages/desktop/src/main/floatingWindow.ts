import type { BrowserWindowConstructorOptions } from 'electron'

/**
 * Default dimensions for the floating controls window
 */
export const FLOATING_WINDOW_DEFAULTS = {
  width: 300,
  height: 200,
  minWidth: 200,
  minHeight: 150,
} as const

/**
 * Returns the BrowserWindow options for the floating controls window.
 * This is extracted to make the configuration testable.
 */
export function getFloatingWindowOptions(
  preloadPath: string,
): BrowserWindowConstructorOptions {
  return {
    width: FLOATING_WINDOW_DEFAULTS.width,
    height: FLOATING_WINDOW_DEFAULTS.height,
    minWidth: FLOATING_WINDOW_DEFAULTS.minWidth,
    minHeight: FLOATING_WINDOW_DEFAULTS.minHeight,
    show: false,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: true,
    webPreferences: {
      preload: preloadPath,
      sandbox: false,
    },
  }
}

/**
 * Returns the URL to load in the floating controls window.
 * In dev mode, loads from Vite dev server. In production, loads bundled file.
 */
export function getFloatingWindowUrl(isDev: boolean): string {
  if (isDev) {
    return 'http://localhost:5173/floating-controls'
  }
  // Production uses hash routing to load the same index.html with different route
  return '' // Will be loaded via loadFile with hash
}

/**
 * Returns the hash to use when loading the floating window in production.
 */
export function getFloatingWindowHash(): string {
  return '/floating-controls'
}
