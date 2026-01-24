/**
 * Get macOS System Preferences URL for a specific privacy panel.
 * Returns null on non-macOS platforms.
 */
export function getSystemPreferencesUrl(
  panel: 'screenRecording' | 'microphone' | 'camera',
): string | null {
  // Stub implementation
  return null
}

/**
 * Check if the current platform supports opening system preferences.
 */
export function isSystemPreferencesSupported(): boolean {
  // Stub implementation
  return false
}
