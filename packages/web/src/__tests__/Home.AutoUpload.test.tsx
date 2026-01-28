import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Mock the electron module
vi.mock('../utils/electron', () => ({
  setRecordingState: vi.fn(),
  isElectron: vi.fn(() => false),
  isElectronCheck: vi.fn(() => false),
  countdownStart: vi.fn(),
  countdownTick: vi.fn(),
  countdownEnd: vi.fn(),
}))

// Mock the API
vi.mock('../api/recordings', () => ({
  getRecordings: vi.fn(() => Promise.resolve({ success: true, data: { recordings: [], total: 0 } })),
  getThumbnailUrl: vi.fn(),
}))

import Home from '../pages/Home/Web'

// Create mock recorder service
const createMockRecorderService = () => {
  const stateCallbacks: Set<(state: string) => void> = new Set()
  return {
    acquireScreen: vi.fn(() =>
      Promise.resolve({
        stream: { getTracks: () => [] },
        release: vi.fn(),
      }),
    ),
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
    onStreamEnded: vi.fn(() => () => {}),
    getState: vi.fn(() => 'idle'),
  }
}

// Create mock upload manager
const createMockUploadManager = () => ({
  enqueue: vi.fn(() => Promise.resolve()),
  onQueueChange: vi.fn(() => () => {}),
  getQueue: vi.fn(() => Promise.resolve([])),
})

describe('Home - Auto-Upload Integration', () => {
  let mockRecorderService: ReturnType<typeof createMockRecorderService>
  let mockUploadManager: ReturnType<typeof createMockUploadManager>

  beforeEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
    localStorage.clear()
    mockRecorderService = createMockRecorderService()
    mockUploadManager = createMockUploadManager()
  })

  afterEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
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

  describe('auto-upload enabled (default)', () => {
    it('enqueues recording for upload when auto-upload is enabled', async () => {
      // Default: auto-upload is enabled (no localStorage value means true)
      renderHome()

      // Open settings, start recording
      fireEvent.click(screen.getByRole('button', { name: /start recording/i }))

      // Start recording
      fireEvent.click(screen.getByRole('button', { name: /start recording/i }))

      // Wait for recording to start
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

      // Wait for naming modal and click Save
      await waitFor(() => {
        expect(screen.getByTestId('recording-name-modal')).toBeInTheDocument()
      })
      fireEvent.click(screen.getByRole('button', { name: /save/i }))

      // Should enqueue for upload
      await waitFor(() => {
        expect(mockUploadManager.enqueue).toHaveBeenCalled()
      })
    })
  })

  describe('auto-upload disabled', () => {
    it('does not enqueue recording for upload when auto-upload is disabled', async () => {
      // Disable auto-upload via localStorage (as it would be set from Settings page)
      localStorage.setItem('just-recordings-auto-upload', 'false')

      renderHome()

      // Open settings
      fireEvent.click(screen.getByRole('button', { name: /start recording/i }))

      // Start recording
      fireEvent.click(screen.getByRole('button', { name: /start recording/i }))

      // Wait for recording to start
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

      // Wait for naming modal and click Save
      await waitFor(() => {
        expect(screen.getByTestId('recording-name-modal')).toBeInTheDocument()
      })
      fireEvent.click(screen.getByRole('button', { name: /save/i }))

      await waitFor(() => {
        expect(mockRecorderService.stopRecording).toHaveBeenCalled()
      })

      // Should NOT enqueue for upload
      expect(mockUploadManager.enqueue).not.toHaveBeenCalled()
    })

    it('reads auto-upload setting from localStorage', async () => {
      // Set auto-upload to false via localStorage
      localStorage.setItem('just-recordings-auto-upload', 'false')

      renderHome()

      // Open settings and start recording
      fireEvent.click(screen.getByRole('button', { name: /start recording/i }))
      fireEvent.click(screen.getByRole('button', { name: /start recording/i }))

      // Wait for recording to start
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

      // Wait for naming modal and click Save
      await waitFor(() => {
        expect(screen.getByTestId('recording-name-modal')).toBeInTheDocument()
      })
      fireEvent.click(screen.getByRole('button', { name: /save/i }))

      await waitFor(() => {
        expect(mockRecorderService.stopRecording).toHaveBeenCalled()
      })

      // Should NOT enqueue since auto-upload is disabled in localStorage
      expect(mockUploadManager.enqueue).not.toHaveBeenCalled()
    })
  })
})
