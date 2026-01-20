import { describe, expect, it } from 'vitest'

describe('Recorder package setup', () => {
  it('has jsdom environment configured', () => {
    // Verify we're running in jsdom by checking for DOM APIs
    expect(typeof window).toBe('object')
    expect(typeof document).toBe('object')
  })

  it('has IndexedDB available', () => {
    // IndexedDB should be available in jsdom environment
    expect(typeof indexedDB).toBe('object')
  })
})
