import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Mock the electron module
vi.mock('../utils/electron', () => ({
  setRecordingState: vi.fn(),
  isElectron: vi.fn(() => false),
}))

// Mock the API
vi.mock('../api', () => ({
  getRecordings: vi.fn(() => Promise.resolve({ success: true, recordings: [] })),
  getThumbnailUrl: vi.fn(),
}))

import { setRecordingState } from '../utils/electron'
import Home from '../pages/Home'

// Create mock recorder service
const createMockRecorderService = () => ({
  startScreenRecording: vi.fn(() => Promise.resolve()),
  stopRecording: vi.fn(() =>
    Promise.resolve({
      name: 'Test Recording',
      blob: new Blob(),
      mimeType: 'video/webm',
      duration: 1000,
      createdAt: new Date(),
      fileSize: 100,
    }),
  ),
  onStateChange: vi.fn((callback: (state: string) => void) => {
    // Store callback to trigger state changes
    ;(createMockRecorderService as { stateCallback?: (state: string) => void }).stateCallback =
      callback
    return () => {}
  }),
  getState: vi.fn(() => 'idle'),
})

// Create mock upload manager
const createMockUploadManager = () => ({
  enqueue: vi.fn(() => Promise.resolve()),
  onQueueChange: vi.fn(() => () => {}),
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

  const renderHome = () => {
    return render(
      <MemoryRouter>
        <Home
          recorderService={mockRecorderService as never}
          uploadManager={mockUploadManager as never}
        />
      </MemoryRouter>,
    )
  }

  it('calls setRecordingState(true) when recording starts', async () => {
    renderHome()

    const startButton = screen.getByRole('button', { name: /start recording/i })
    fireEvent.click(startButton)

    await waitFor(() => {
      expect(mockRecorderService.startScreenRecording).toHaveBeenCalled()
    })

    expect(setRecordingState).toHaveBeenCalledWith(true)
  })

  it('calls setRecordingState(false) when recording stops', async () => {
    // Start with recording state
    mockRecorderService.getState = vi.fn(() => 'recording')
    mockRecorderService.onStateChange = vi.fn((callback: (state: string) => void) => {
      callback('recording') // Immediately set to recording state
      return () => {}
    })

    renderHome()

    const stopButton = screen.getByRole('button', { name: /stop recording/i })
    fireEvent.click(stopButton)

    await waitFor(() => {
      expect(mockRecorderService.stopRecording).toHaveBeenCalled()
    })

    expect(setRecordingState).toHaveBeenCalledWith(false)
  })
})
