import { afterEach, describe, expect, it, vi } from 'vitest'
import { isElectron, setRecordingState } from '../utils/electron'

describe('isElectron', () => {
  afterEach(() => {
    // Clean up window.api after each test
    delete (window as { api?: unknown }).api
  })

  it('returns true when window.api is defined', () => {
    ;(window as { api?: unknown }).api = {
      setRecordingState: vi.fn(),
      getVersions: vi.fn(),
    }

    expect(isElectron()).toBe(true)
  })

  it('returns false when window.api is undefined', () => {
    expect(isElectron()).toBe(false)
  })
})

describe('setRecordingState', () => {
  afterEach(() => {
    delete (window as { api?: unknown }).api
  })

  it('calls window.api.setRecordingState when in Electron', () => {
    const mockSetRecordingState = vi.fn()
    ;(window as { api?: unknown }).api = {
      setRecordingState: mockSetRecordingState,
      getVersions: vi.fn(),
    }

    setRecordingState(true)

    expect(mockSetRecordingState).toHaveBeenCalledWith(true)
  })

  it('does not throw when window.api is undefined', () => {
    expect(() => setRecordingState(true)).not.toThrow()
  })
})
