import type { BrowserWindowConstructorOptions, Rectangle } from 'electron'

/**
 * Storage key for persisting floating window bounds
 */
export const FLOATING_WINDOW_STORAGE_KEY = 'floating-window-bounds'

/**
 * Represents the bounds of a floating window
 */
export interface FloatingWindowBounds {
  x: number
  y: number
  width: number
  height: number
}

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
      // Share the same persistent partition as main window for consistent storage
      partition: 'persist:main',
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

/**
 * Saves the floating window bounds to the provided storage.
 */
export function saveFloatingWindowBounds(
  bounds: FloatingWindowBounds,
  storage: { setItem: (key: string, value: string) => void },
): void {
  storage.setItem(FLOATING_WINDOW_STORAGE_KEY, JSON.stringify(bounds))
}

/**
 * Loads saved floating window bounds from storage.
 * Returns null if no saved bounds exist or if parsing fails.
 */
export function loadFloatingWindowBounds(storage: {
  getItem: (key: string) => string | null
}): FloatingWindowBounds | null {
  const saved = storage.getItem(FLOATING_WINDOW_STORAGE_KEY)
  if (!saved) {
    return null
  }
  try {
    return JSON.parse(saved) as FloatingWindowBounds
  } catch {
    return null
  }
}

/**
 * Validates that window bounds are within visible screen area.
 * Returns adjusted bounds if the position is off-screen, or the original bounds if valid.
 */
export function validateWindowBounds(
  bounds: FloatingWindowBounds,
  screenBounds: Rectangle,
): FloatingWindowBounds {
  let { x, y } = bounds
  const { width, height } = bounds

  // Ensure window is not off the left edge
  if (x < screenBounds.x) {
    x = screenBounds.x
  }

  // Ensure window is not off the top edge
  if (y < screenBounds.y) {
    y = screenBounds.y
  }

  // Ensure window is not off the right edge
  const maxX = screenBounds.x + screenBounds.width - width
  if (x > maxX) {
    x = maxX
  }

  // Ensure window is not off the bottom edge
  const maxY = screenBounds.y + screenBounds.height - height
  if (y > maxY) {
    y = maxY
  }

  return { x, y, width, height }
}

/**
 * Returns window options with saved bounds applied (if available and valid).
 */
export function getFloatingWindowOptionsWithBounds(
  preloadPath: string,
  savedBounds: FloatingWindowBounds | null,
  screenBounds: Rectangle,
): BrowserWindowConstructorOptions {
  const baseOptions = getFloatingWindowOptions(preloadPath)

  if (!savedBounds) {
    return baseOptions
  }

  const validatedBounds = validateWindowBounds(savedBounds, screenBounds)

  return {
    ...baseOptions,
    x: validatedBounds.x,
    y: validatedBounds.y,
    width: validatedBounds.width,
    height: validatedBounds.height,
  }
}
