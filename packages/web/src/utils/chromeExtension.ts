/* eslint-disable @typescript-eslint/no-explicit-any */
export function isChromeExtensionCheck(): boolean {
  const g = globalThis as any
  return typeof g.chrome !== 'undefined' && typeof g.chrome.runtime !== 'undefined' && !!g.chrome.runtime.id
}
