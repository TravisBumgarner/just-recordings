const PRIVACY_PANEL_URLS = {
  screenRecording: 'x-apple.systempreferences:com.apple.preference.security?Privacy_ScreenCapture',
  microphone: 'x-apple.systempreferences:com.apple.preference.security?Privacy_Microphone',
  camera: 'x-apple.systempreferences:com.apple.preference.security?Privacy_Camera',
} as const

/**
 * Get macOS System Preferences URL for a specific privacy panel.
 * Returns null on non-macOS platforms.
 */
export function getSystemPreferencesUrl(
  panel: 'screenRecording' | 'microphone' | 'camera',
): string | null {
  if (process.platform !== 'darwin') {
    return null
  }
  return PRIVACY_PANEL_URLS[panel]
}

/**
 * Check if the current platform supports opening system preferences.
 */
export function isSystemPreferencesSupported(): boolean {
  return process.platform === 'darwin'
}
