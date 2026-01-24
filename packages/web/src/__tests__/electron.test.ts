import { afterEach, describe, expect, it, vi } from 'vitest'
import { isElectronCheck, setRecordingState, setSetupMode } from '../utils/electron'

describe('isElectronCheck', () => {
  afterEach(() => {
    // Clean up window.api after each test
    delete (window as { api?: unknown }).api
  })

  it('returns true when window.api is defined', () => {
    ;(window as { api?: unknown }).api = {
      setRecordingState: vi.fn(),
      getVersions: vi.fn(),
    }

    expect(isElectronCheck()).toBe(true)
  })

  it('returns false when window.api is undefined', () => {
    expect(isElectronCheck()).toBe(false)
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

describe('setSetupMode', () => {
  afterEach(() => {
    delete (window as { api?: unknown }).api
  })

  it('calls window.api.setSetupMode when in Electron', () => {
    const mockSetSetupMode = vi.fn()
    ;(window as { api?: unknown }).api = {
      setSetupMode: mockSetSetupMode,
      setRecordingState: vi.fn(),
      getVersions: vi.fn(),
    }

    setSetupMode(true)

    expect(mockSetSetupMode).toHaveBeenCalledWith(true)
  })

  it('calls window.api.setSetupMode with false', () => {
    const mockSetSetupMode = vi.fn()
    ;(window as { api?: unknown }).api = {
      setSetupMode: mockSetSetupMode,
      setRecordingState: vi.fn(),
      getVersions: vi.fn(),
    }

    setSetupMode(false)

    expect(mockSetSetupMode).toHaveBeenCalledWith(false)
  })

  it('does not throw when window.api is undefined', () => {
    expect(() => setSetupMode(true)).not.toThrow()
  })
})
