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

// Mock navigator.mediaDevices.enumerateDevices
const mockEnumerateDevices = vi.fn(() =>
  Promise.resolve([
    { deviceId: 'mic-1', kind: 'audioinput', label: 'Microphone 1' },
    { deviceId: 'cam-1', kind: 'videoinput', label: 'Camera 1' },
  ]),
)

import Home from '../pages/Home.Web'

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
        name: 'Recording 2026-01-26T14:30:00.000Z',
        blob: new Blob(),
        mimeType: 'video/webm',
        duration: 1000,
        createdAt: new Date('2026-01-26T14:30:00'),
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

describe('Home - Recording Naming Flow', () => {
  let mockRecorderService: ReturnType<typeof createMockRecorderService>
  let mockUploadManager: ReturnType<typeof createMockUploadManager>

  beforeEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
    localStorage.clear()
    mockRecorderService = createMockRecorderService()
    mockUploadManager = createMockUploadManager()

    // Setup mock for enumerateDevices
    Object.defineProperty(navigator, 'mediaDevices', {
      value: {
        enumerateDevices: mockEnumerateDevices,
        getUserMedia: vi.fn(() => Promise.resolve({ getTracks: () => [] })),
      },
      writable: true,
      configurable: true,
    })
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

  // Helper to start a recording and get to recording state
  const startRecording = async () => {
    // Open settings
    fireEvent.click(screen.getByRole('button', { name: /start recording/i }))
    // Start recording from settings modal
    fireEvent.click(screen.getByRole('button', { name: /start recording/i }))

    // Wait for recording to start
    await waitFor(
      () => {
        expect(screen.getByTestId('recording-controls-modal')).toBeInTheDocument()
      },
      { timeout: 5000 },
    )
  }

  describe('naming modal appears after stop', () => {
    it('shows naming modal when stop is clicked', async () => {
      renderHome()
      await startRecording()

      // Click stop
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /stop/i }))
      })

      // Wait for naming modal to appear
      await waitFor(() => {
        expect(screen.getByTestId('recording-name-modal')).toBeInTheDocument()
      })
    })

    it('pre-fills with default name based on timestamp', async () => {
      renderHome()
      await startRecording()

      // Click stop
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /stop/i }))
      })

      // Wait for naming modal and check input
      await waitFor(() => {
        const input = screen.getByTestId('recording-name-input') as HTMLInputElement
        expect(input.value).toMatch(/^Recording/)
      })
    })
  })

  describe('saving with custom name', () => {
    it('enqueues recording with custom name when user enters one', async () => {
      renderHome()
      await startRecording()

      // Click stop
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /stop/i }))
      })

      // Wait for naming modal
      await waitFor(() => {
        expect(screen.getByTestId('recording-name-modal')).toBeInTheDocument()
      })

      // Enter custom name
      const input = screen.getByTestId('recording-name-input')
      fireEvent.change(input, { target: { value: 'My Important Meeting' } })

      // Click save
      fireEvent.click(screen.getByRole('button', { name: /save/i }))

      // Verify recording was enqueued with custom name
      await waitFor(() => {
        expect(mockUploadManager.enqueue).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'My Important Meeting',
          }),
        )
      })
    })

    it('closes naming modal after save', async () => {
      renderHome()
      await startRecording()

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /stop/i }))
      })

      await waitFor(() => {
        expect(screen.getByTestId('recording-name-modal')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByRole('button', { name: /save/i }))

      await waitFor(() => {
        expect(screen.queryByTestId('recording-name-modal')).not.toBeInTheDocument()
      })
    })
  })

  describe('cancelling the naming modal', () => {
    it('uses default name when cancel is clicked', async () => {
      renderHome()
      await startRecording()

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /stop/i }))
      })

      await waitFor(() => {
        expect(screen.getByTestId('recording-name-modal')).toBeInTheDocument()
      })

      // Click cancel
      fireEvent.click(screen.getByRole('button', { name: /cancel/i }))

      // Should still enqueue with default name
      await waitFor(() => {
        expect(mockUploadManager.enqueue).toHaveBeenCalledWith(
          expect.objectContaining({
            name: expect.stringMatching(/^Recording/),
          }),
        )
      })
    })

    it('closes naming modal after cancel', async () => {
      renderHome()
      await startRecording()

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /stop/i }))
      })

      await waitFor(() => {
        expect(screen.getByTestId('recording-name-modal')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByRole('button', { name: /cancel/i }))

      await waitFor(() => {
        expect(screen.queryByTestId('recording-name-modal')).not.toBeInTheDocument()
      })
    })
  })
})
