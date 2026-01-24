import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Mock the electron module
vi.mock('../utils/electron', () => ({
  setRecordingState: vi.fn(),
  isElectron: vi.fn(() => false),
}))

// Mock the API
vi.mock('../api/recordings', () => ({
  getRecordings: vi.fn(() => Promise.resolve({ success: true, data: [] })),
  getThumbnailUrl: vi.fn(),
}))

import Home from '../pages/Home.Web'
import { setRecordingState } from '../utils/electron'

// Create mock recorder service
const createMockRecorderService = () => {
  const stateCallbacks: Set<(state: string) => void> = new Set()
  return {
    startScreenRecording: vi.fn(() => Promise.resolve()),
    stopRecording: vi.fn(() =>
      Promise.resolve({
        id: 1,
        name: 'Test Recording',
        blob: new Blob(),
        mimeType: 'video/webm',
        duration: 1000,
        createdAt: new Date(),
        fileSize: 100,
        uploadStatus: 'pending',
      }),
    ),
    pauseRecording: vi.fn(),
    resumeRecording: vi.fn(),
    cancelRecording: vi.fn(),
    getElapsedTime: vi.fn(() => 5000),
    onStateChange: vi.fn((callback: (state: string) => void) => {
      stateCallbacks.add(callback)
      return () => {
        stateCallbacks.delete(callback)
      }
    }),
    getState: vi.fn(() => 'idle'),
    // Helper to trigger state changes in tests
    _triggerStateChange: (state: string) => {
      for (const callback of stateCallbacks) {
        callback(state)
      }
    },
  }
}

// Create mock upload manager
const createMockUploadManager = () => ({
  enqueue: vi.fn(() => Promise.resolve()),
  onQueueChange: vi.fn(() => () => {}),
  getQueue: vi.fn(() => Promise.resolve([])),
})

describe('Home - Recording Flow Integration', () => {
  let mockRecorderService: ReturnType<typeof createMockRecorderService>
  let mockUploadManager: ReturnType<typeof createMockUploadManager>

  beforeEach(() => {
    vi.useFakeTimers()
    vi.clearAllMocks()
    mockRecorderService = createMockRecorderService()
    mockUploadManager = createMockUploadManager()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  const createTestQueryClient = () =>
    new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    })

  const renderHome = () => {
    const queryClient = createTestQueryClient()
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <Home
            recorderService={mockRecorderService as never}
            uploadManager={mockUploadManager as never}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    )
  }

  describe('Start Recording button opens settings modal', () => {
    it('shows settings modal when Start Recording is clicked', () => {
      renderHome()

      const startButton = screen.getByRole('button', { name: /start recording/i })
      fireEvent.click(startButton)

      expect(screen.getByTestId('recording-settings-modal')).toBeInTheDocument()
    })
  })

  describe('Settings → Start → Countdown → Recording flow', () => {
    it('shows countdown overlay after clicking start in settings modal', () => {
      renderHome()

      // Open settings
      fireEvent.click(screen.getByRole('button', { name: /start recording/i }))

      // Click start recording in settings modal
      fireEvent.click(screen.getByRole('button', { name: /start recording/i }))

      expect(screen.getByTestId('countdown-overlay')).toBeInTheDocument()
    })

    it('starts recording after countdown completes', async () => {
      vi.useRealTimers() // Use real timers for this test

      renderHome()

      // Open settings and start
      fireEvent.click(screen.getByRole('button', { name: /start recording/i }))
      fireEvent.click(screen.getByRole('button', { name: /start recording/i }))

      // Wait for countdown to complete (3 seconds + buffer)
      await waitFor(
        () => {
          expect(mockRecorderService.startScreenRecording).toHaveBeenCalled()
        },
        { timeout: 5000 },
      )
    })

    it('passes selected settings to recorder service', async () => {
      vi.useRealTimers() // Use real timers for countdown-based test

      renderHome()

      // Open settings
      fireEvent.click(screen.getByRole('button', { name: /start recording/i }))

      // Select options
      fireEvent.click(screen.getByRole('checkbox', { name: /system audio/i }))
      fireEvent.click(screen.getByRole('checkbox', { name: /microphone/i }))

      // Start recording
      fireEvent.click(screen.getByRole('button', { name: /start recording/i }))

      // Wait for countdown to complete and recording to start
      await waitFor(
        () => {
          expect(mockRecorderService.startScreenRecording).toHaveBeenCalledWith(
            expect.objectContaining({
              includeSystemAudio: true,
              includeMicrophone: true,
              includeWebcam: false,
            }),
          )
        },
        { timeout: 5000 },
      )
    })
  })

  describe('Recording controls accessible during recording', () => {
    it('shows recording controls modal when recording', async () => {
      vi.useRealTimers() // Use real timers for countdown-based test

      renderHome()

      // Start the full recording flow
      fireEvent.click(screen.getByRole('button', { name: /start recording/i }))
      fireEvent.click(screen.getByRole('button', { name: /start recording/i }))

      await waitFor(
        () => {
          expect(mockRecorderService.startScreenRecording).toHaveBeenCalled()
        },
        { timeout: 5000 },
      )

      expect(screen.getByTestId('recording-controls-modal')).toBeInTheDocument()
    })
  })

  describe('Stop saves and shows in upload queue', () => {
    it('calls stopRecording and enqueues for upload when stop is clicked', async () => {
      vi.useRealTimers() // Use real timers for countdown-based test

      renderHome()

      // Start recording
      fireEvent.click(screen.getByRole('button', { name: /start recording/i }))
      fireEvent.click(screen.getByRole('button', { name: /start recording/i }))

      await waitFor(
        () => {
          expect(screen.getByTestId('recording-controls-modal')).toBeInTheDocument()
        },
        { timeout: 5000 },
      )

      // Click stop
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /stop/i }))
      })

      await waitFor(() => {
        expect(mockRecorderService.stopRecording).toHaveBeenCalled()
      })

      await waitFor(() => {
        expect(mockUploadManager.enqueue).toHaveBeenCalled()
      })
    })
  })

  describe('Cancel/Restart work correctly', () => {
    it('discards recording when cancel is confirmed', async () => {
      vi.useRealTimers() // Use real timers for countdown-based test

      renderHome()

      // Start recording
      fireEvent.click(screen.getByRole('button', { name: /start recording/i }))
      fireEvent.click(screen.getByRole('button', { name: /start recording/i }))

      await waitFor(
        () => {
          expect(screen.getByTestId('recording-controls-modal')).toBeInTheDocument()
        },
        { timeout: 5000 },
      )

      // Click cancel then confirm
      fireEvent.click(screen.getByRole('button', { name: /cancel/i }))
      fireEvent.click(screen.getByRole('button', { name: /confirm/i }))

      await waitFor(() => {
        expect(mockRecorderService.cancelRecording).toHaveBeenCalled()
      })

      // Should not have enqueued anything
      expect(mockUploadManager.enqueue).not.toHaveBeenCalled()
    })

    it('shows countdown again when restart is confirmed', async () => {
      vi.useRealTimers() // Use real timers for countdown-based test

      renderHome()

      // Start recording
      fireEvent.click(screen.getByRole('button', { name: /start recording/i }))
      fireEvent.click(screen.getByRole('button', { name: /start recording/i }))

      await waitFor(
        () => {
          expect(screen.getByTestId('recording-controls-modal')).toBeInTheDocument()
        },
        { timeout: 5000 },
      )

      // Click restart then confirm
      fireEvent.click(screen.getByRole('button', { name: /restart/i }))
      fireEvent.click(screen.getByRole('button', { name: /confirm/i }))

      await waitFor(() => {
        expect(mockRecorderService.cancelRecording).toHaveBeenCalled()
      })

      // Countdown should appear again
      expect(screen.getByTestId('countdown-overlay')).toBeInTheDocument()
    })
  })

  describe('Desktop tray icon updates on recording state', () => {
    it('calls setRecordingState(true) when recording starts', async () => {
      vi.useRealTimers() // Use real timers for countdown-based test

      renderHome()

      // Start recording flow
      fireEvent.click(screen.getByRole('button', { name: /start recording/i }))
      fireEvent.click(screen.getByRole('button', { name: /start recording/i }))

      await waitFor(
        () => {
          expect(mockRecorderService.startScreenRecording).toHaveBeenCalled()
        },
        { timeout: 5000 },
      )

      expect(setRecordingState).toHaveBeenCalledWith(true)
    })

    it('calls setRecordingState(false) when recording stops', async () => {
      vi.useRealTimers() // Use real timers for countdown-based test

      renderHome()

      // Start recording
      fireEvent.click(screen.getByRole('button', { name: /start recording/i }))
      fireEvent.click(screen.getByRole('button', { name: /start recording/i }))

      await waitFor(
        () => {
          expect(screen.getByTestId('recording-controls-modal')).toBeInTheDocument()
        },
        { timeout: 5000 },
      )

      // Stop recording
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /stop/i }))
      })

      await waitFor(() => {
        expect(setRecordingState).toHaveBeenCalledWith(false)
      })
    })

    it('calls setRecordingState(false) when recording is cancelled', async () => {
      vi.useRealTimers() // Use real timers for countdown-based test

      renderHome()

      // Start recording
      fireEvent.click(screen.getByRole('button', { name: /start recording/i }))
      fireEvent.click(screen.getByRole('button', { name: /start recording/i }))

      await waitFor(
        () => {
          expect(screen.getByTestId('recording-controls-modal')).toBeInTheDocument()
        },
        { timeout: 5000 },
      )

      // Cancel recording
      fireEvent.click(screen.getByRole('button', { name: /cancel/i }))
      fireEvent.click(screen.getByRole('button', { name: /confirm/i }))

      await waitFor(() => {
        expect(setRecordingState).toHaveBeenCalledWith(false)
      })
    })
  })
})
