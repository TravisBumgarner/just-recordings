import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Mock the electron module
vi.mock('../utils/electron', () => ({
  setRecordingState: vi.fn(),
  isElectron: vi.fn(() => false),
  countdownStart: vi.fn(),
  countdownTick: vi.fn(),
  countdownEnd: vi.fn(),
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
    getState: vi.fn(() => 'idle'),
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

describe('Home - Electron IPC integration', () => {
  let mockRecorderService: ReturnType<typeof createMockRecorderService>
  let mockUploadManager: ReturnType<typeof createMockUploadManager>

  beforeEach(() => {
    vi.clearAllMocks()
    mockRecorderService = createMockRecorderService()
    mockUploadManager = createMockUploadManager()
  })

  afterEach(() => {
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

  it('calls setRecordingState(true) when recording starts', async () => {
    vi.useRealTimers() // Use real timers for countdown-based test

    renderHome()

    // Open settings modal
    fireEvent.click(screen.getByRole('button', { name: /start recording/i }))
    // Start recording from settings modal
    fireEvent.click(screen.getByRole('button', { name: /start recording/i }))

    // Wait for countdown to complete and recording to start
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

    // Start recording through the flow
    fireEvent.click(screen.getByRole('button', { name: /start recording/i }))
    fireEvent.click(screen.getByRole('button', { name: /start recording/i }))

    // Wait for recording to start
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
      expect(setRecordingState).toHaveBeenCalledWith(false)
    })
  })
})
