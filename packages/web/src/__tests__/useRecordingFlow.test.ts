import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useRecordingFlow, type RecordingSettings } from '../hooks/useRecordingFlow'
import type { Recording } from '@just-recordings/recorder'

// Mock RecorderService
const createMockRecorderService = () => ({
  getState: vi.fn().mockReturnValue('idle'),
  onStateChange: vi.fn().mockReturnValue(() => {}),
  startScreenRecording: vi.fn().mockResolvedValue(undefined),
  stopRecording: vi.fn().mockResolvedValue({
    id: 1,
    name: 'Test Recording',
    blob: new Blob(),
    mimeType: 'video/webm',
    duration: 5000,
    createdAt: new Date(),
    fileSize: 1000,
    uploadStatus: 'pending',
  } as Recording),
  pauseRecording: vi.fn(),
  resumeRecording: vi.fn(),
  cancelRecording: vi.fn(),
  getElapsedTime: vi.fn().mockReturnValue(0),
  saveRecording: vi.fn().mockResolvedValue(1),
})

describe('useRecordingFlow', () => {
  const defaultSettings: RecordingSettings = {
    includeSystemAudio: false,
    includeMicrophone: false,
    includeWebcam: false,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('starts with flowState as idle', () => {
      const mockService = createMockRecorderService()
      const { result } = renderHook(() =>
        useRecordingFlow({ recorderService: mockService as any }),
      )

      expect(result.current.flowState).toBe('idle')
    })

    it('starts with recorderState as idle', () => {
      const mockService = createMockRecorderService()
      const { result } = renderHook(() =>
        useRecordingFlow({ recorderService: mockService as any }),
      )

      expect(result.current.recorderState).toBe('idle')
    })

    it('starts with currentSettings as null', () => {
      const mockService = createMockRecorderService()
      const { result } = renderHook(() =>
        useRecordingFlow({ recorderService: mockService as any }),
      )

      expect(result.current.currentSettings).toBeNull()
    })
  })

  describe('flowState transitions', () => {
    it('transitions from idle to settings when openSettings is called', () => {
      const mockService = createMockRecorderService()
      const { result } = renderHook(() =>
        useRecordingFlow({ recorderService: mockService as any }),
      )

      act(() => {
        result.current.openSettings()
      })

      expect(result.current.flowState).toBe('settings')
    })

    it('transitions from settings to idle when closeSettings is called', () => {
      const mockService = createMockRecorderService()
      const { result } = renderHook(() =>
        useRecordingFlow({ recorderService: mockService as any }),
      )

      act(() => {
        result.current.openSettings()
      })
      expect(result.current.flowState).toBe('settings')

      act(() => {
        result.current.closeSettings()
      })
      expect(result.current.flowState).toBe('idle')
    })

    it('transitions from settings to countdown when startWithSettings is called', () => {
      const mockService = createMockRecorderService()
      const { result } = renderHook(() =>
        useRecordingFlow({ recorderService: mockService as any }),
      )

      act(() => {
        result.current.openSettings()
      })

      act(() => {
        result.current.startWithSettings(defaultSettings)
      })

      expect(result.current.flowState).toBe('countdown')
    })

    it('stores settings when startWithSettings is called', () => {
      const mockService = createMockRecorderService()
      const { result } = renderHook(() =>
        useRecordingFlow({ recorderService: mockService as any }),
      )

      const settings: RecordingSettings = {
        includeSystemAudio: true,
        includeMicrophone: true,
        includeWebcam: false,
      }

      act(() => {
        result.current.openSettings()
        result.current.startWithSettings(settings)
      })

      expect(result.current.currentSettings).toEqual(settings)
    })

    it('transitions from countdown to recording when onCountdownComplete is called', async () => {
      const mockService = createMockRecorderService()
      const { result } = renderHook(() =>
        useRecordingFlow({ recorderService: mockService as any }),
      )

      act(() => {
        result.current.openSettings()
        result.current.startWithSettings(defaultSettings)
      })

      await act(async () => {
        await result.current.onCountdownComplete()
      })

      expect(result.current.flowState).toBe('recording')
    })
  })

  describe('settings passed to RecorderService', () => {
    it('passes settings to startScreenRecording when countdown completes', async () => {
      const mockService = createMockRecorderService()
      const { result } = renderHook(() =>
        useRecordingFlow({ recorderService: mockService as any }),
      )

      const settings: RecordingSettings = {
        includeSystemAudio: true,
        includeMicrophone: true,
        includeWebcam: false,
      }

      act(() => {
        result.current.openSettings()
        result.current.startWithSettings(settings)
      })

      await act(async () => {
        await result.current.onCountdownComplete()
      })

      expect(mockService.startScreenRecording).toHaveBeenCalledWith({
        includeSystemAudio: true,
        includeMicrophone: true,
        includeWebcam: false,
      })
    })
  })

  describe('stop recording', () => {
    it('transitions to saving then idle when stop is called', async () => {
      const mockService = createMockRecorderService()
      const { result } = renderHook(() =>
        useRecordingFlow({ recorderService: mockService as any }),
      )

      // Get to recording state
      act(() => {
        result.current.openSettings()
        result.current.startWithSettings(defaultSettings)
      })
      await act(async () => {
        await result.current.onCountdownComplete()
      })

      // Stop recording
      await act(async () => {
        await result.current.stop()
      })

      expect(result.current.flowState).toBe('idle')
    })

    it('calls stopRecording on RecorderService', async () => {
      const mockService = createMockRecorderService()
      const { result } = renderHook(() =>
        useRecordingFlow({ recorderService: mockService as any }),
      )

      // Get to recording state
      act(() => {
        result.current.openSettings()
        result.current.startWithSettings(defaultSettings)
      })
      await act(async () => {
        await result.current.onCountdownComplete()
      })

      await act(async () => {
        await result.current.stop()
      })

      expect(mockService.stopRecording).toHaveBeenCalled()
    })

    it('calls onRecordingSaved callback with the recording', async () => {
      const mockService = createMockRecorderService()
      const onRecordingSaved = vi.fn()
      const { result } = renderHook(() =>
        useRecordingFlow({ recorderService: mockService as any, onRecordingSaved }),
      )

      // Get to recording state
      act(() => {
        result.current.openSettings()
        result.current.startWithSettings(defaultSettings)
      })
      await act(async () => {
        await result.current.onCountdownComplete()
      })

      await act(async () => {
        await result.current.stop()
      })

      expect(onRecordingSaved).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Test Recording',
          uploadStatus: 'pending',
        }),
      )
    })
  })

  describe('cancel recording', () => {
    it('transitions from recording to idle when cancel is called', async () => {
      const mockService = createMockRecorderService()
      const { result } = renderHook(() =>
        useRecordingFlow({ recorderService: mockService as any }),
      )

      // Get to recording state
      act(() => {
        result.current.openSettings()
        result.current.startWithSettings(defaultSettings)
      })
      await act(async () => {
        await result.current.onCountdownComplete()
      })

      act(() => {
        result.current.cancel()
      })

      expect(result.current.flowState).toBe('idle')
    })

    it('calls cancelRecording on RecorderService', async () => {
      const mockService = createMockRecorderService()
      const { result } = renderHook(() =>
        useRecordingFlow({ recorderService: mockService as any }),
      )

      // Get to recording state
      act(() => {
        result.current.openSettings()
        result.current.startWithSettings(defaultSettings)
      })
      await act(async () => {
        await result.current.onCountdownComplete()
      })

      act(() => {
        result.current.cancel()
      })

      expect(mockService.cancelRecording).toHaveBeenCalled()
    })

    it('does not call onRecordingSaved when cancel is called', async () => {
      const mockService = createMockRecorderService()
      const onRecordingSaved = vi.fn()
      const { result } = renderHook(() =>
        useRecordingFlow({ recorderService: mockService as any, onRecordingSaved }),
      )

      // Get to recording state
      act(() => {
        result.current.openSettings()
        result.current.startWithSettings(defaultSettings)
      })
      await act(async () => {
        await result.current.onCountdownComplete()
      })

      act(() => {
        result.current.cancel()
      })

      expect(onRecordingSaved).not.toHaveBeenCalled()
    })

    it('clears currentSettings when cancel is called', async () => {
      const mockService = createMockRecorderService()
      const { result } = renderHook(() =>
        useRecordingFlow({ recorderService: mockService as any }),
      )

      // Get to recording state
      act(() => {
        result.current.openSettings()
        result.current.startWithSettings(defaultSettings)
      })
      await act(async () => {
        await result.current.onCountdownComplete()
      })

      act(() => {
        result.current.cancel()
      })

      expect(result.current.currentSettings).toBeNull()
    })
  })

  describe('restart recording', () => {
    it('transitions from recording to countdown when restart is called', async () => {
      const mockService = createMockRecorderService()
      const { result } = renderHook(() =>
        useRecordingFlow({ recorderService: mockService as any }),
      )

      // Get to recording state
      act(() => {
        result.current.openSettings()
        result.current.startWithSettings(defaultSettings)
      })
      await act(async () => {
        await result.current.onCountdownComplete()
      })

      act(() => {
        result.current.restart()
      })

      expect(result.current.flowState).toBe('countdown')
    })

    it('calls cancelRecording on RecorderService when restart is called', async () => {
      const mockService = createMockRecorderService()
      const { result } = renderHook(() =>
        useRecordingFlow({ recorderService: mockService as any }),
      )

      // Get to recording state
      act(() => {
        result.current.openSettings()
        result.current.startWithSettings(defaultSettings)
      })
      await act(async () => {
        await result.current.onCountdownComplete()
      })

      act(() => {
        result.current.restart()
      })

      expect(mockService.cancelRecording).toHaveBeenCalled()
    })

    it('preserves currentSettings when restart is called', async () => {
      const mockService = createMockRecorderService()
      const { result } = renderHook(() =>
        useRecordingFlow({ recorderService: mockService as any }),
      )

      const settings: RecordingSettings = {
        includeSystemAudio: true,
        includeMicrophone: true,
        includeWebcam: false,
      }

      // Get to recording state
      act(() => {
        result.current.openSettings()
        result.current.startWithSettings(settings)
      })
      await act(async () => {
        await result.current.onCountdownComplete()
      })

      act(() => {
        result.current.restart()
      })

      expect(result.current.currentSettings).toEqual(settings)
    })
  })

  describe('pause and resume', () => {
    it('calls pauseRecording on RecorderService when pause is called', async () => {
      const mockService = createMockRecorderService()
      const { result } = renderHook(() =>
        useRecordingFlow({ recorderService: mockService as any }),
      )

      // Get to recording state
      act(() => {
        result.current.openSettings()
        result.current.startWithSettings(defaultSettings)
      })
      await act(async () => {
        await result.current.onCountdownComplete()
      })

      act(() => {
        result.current.pause()
      })

      expect(mockService.pauseRecording).toHaveBeenCalled()
    })

    it('calls resumeRecording on RecorderService when resume is called', async () => {
      const mockService = createMockRecorderService()
      const { result } = renderHook(() =>
        useRecordingFlow({ recorderService: mockService as any }),
      )

      // Get to recording state
      act(() => {
        result.current.openSettings()
        result.current.startWithSettings(defaultSettings)
      })
      await act(async () => {
        await result.current.onCountdownComplete()
      })

      act(() => {
        result.current.resume()
      })

      expect(mockService.resumeRecording).toHaveBeenCalled()
    })
  })

  describe('getElapsedTime', () => {
    it('delegates to RecorderService.getElapsedTime', async () => {
      const mockService = createMockRecorderService()
      mockService.getElapsedTime.mockReturnValue(5000)
      const { result } = renderHook(() =>
        useRecordingFlow({ recorderService: mockService as any }),
      )

      const elapsed = result.current.getElapsedTime()

      expect(mockService.getElapsedTime).toHaveBeenCalled()
      expect(elapsed).toBe(5000)
    })
  })
})
