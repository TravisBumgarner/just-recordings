import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import RecordingPage from '../Recording'
import type {
  RecorderService,
  RecorderState,
  Recording,
  Uploader,
  UploadResult,
} from '@just-recordings/recorder'

// Mock RecorderService
function createMockRecorderService(initialState: RecorderState = 'idle'): {
  service: RecorderService
  stateCallback: (state: RecorderState) => void
} {
  let stateCallback: (state: RecorderState) => void = () => {}

  const service = {
    getState: vi.fn(() => initialState),
    onStateChange: vi.fn((callback: (state: RecorderState) => void) => {
      stateCallback = callback
      return vi.fn()
    }),
    startScreenRecording: vi.fn(() => Promise.resolve()),
    stopRecording: vi.fn(() =>
      Promise.resolve({
        id: 1,
        name: 'Test Recording',
        blob: new Blob(['test'], { type: 'video/webm' }),
        mimeType: 'video/webm',
        duration: 1000,
        createdAt: new Date(),
        fileSize: 100,
      } as Recording),
    ),
    pauseRecording: vi.fn(),
    resumeRecording: vi.fn(),
    saveRecording: vi.fn(),
    getRecording: vi.fn(),
    getAllRecordings: vi.fn(),
    deleteRecording: vi.fn(),
  } as unknown as RecorderService

  return { service, stateCallback: (state) => stateCallback(state) }
}

// Mock Uploader
function createMockUploader(): Uploader {
  return {
    startUpload: vi.fn(() => Promise.resolve('upload-123')),
    uploadChunk: vi.fn(() => Promise.resolve()),
    finalizeUpload: vi.fn(() =>
      Promise.resolve({
        success: true,
        fileId: 'file-123',
        path: '/uploads/file-123.webm',
        size: 100,
      } as UploadResult),
    ),
  }
}

describe('RecordingPage', () => {
  let mockRecorder: { service: RecorderService; stateCallback: (state: RecorderState) => void }
  let mockUploader: Uploader

  beforeEach(() => {
    mockRecorder = createMockRecorderService()
    mockUploader = createMockUploader()
  })

  describe('rendering', () => {
    it('renders start recording button when idle', () => {
      render(<RecordingPage recorderService={mockRecorder.service} uploader={mockUploader} />)

      expect(screen.getByRole('button', { name: /start recording/i })).toBeInTheDocument()
    })

    it('renders stop recording button when recording', () => {
      mockRecorder = createMockRecorderService('recording')

      render(<RecordingPage recorderService={mockRecorder.service} uploader={mockUploader} />)

      // Trigger state change to 'recording'
      act(() => {
        mockRecorder.stateCallback('recording')
      })

      expect(screen.getByRole('button', { name: /stop recording/i })).toBeInTheDocument()
    })

    it('shows stop button when state changes to recording', async () => {
      render(<RecordingPage recorderService={mockRecorder.service} uploader={mockUploader} />)

      expect(screen.getByRole('button', { name: /start recording/i })).toBeInTheDocument()

      // Simulate state change to recording
      act(() => {
        mockRecorder.stateCallback('recording')
      })

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /stop recording/i })).toBeInTheDocument()
      })
    })
  })

  describe('recording controls', () => {
    it('calls startScreenRecording when start button clicked', async () => {
      render(<RecordingPage recorderService={mockRecorder.service} uploader={mockUploader} />)

      fireEvent.click(screen.getByRole('button', { name: /start recording/i }))

      expect(mockRecorder.service.startScreenRecording).toHaveBeenCalled()
    })

    it('calls stopRecording when stop button clicked', async () => {
      render(<RecordingPage recorderService={mockRecorder.service} uploader={mockUploader} />)

      // Change to recording state
      act(() => {
        mockRecorder.stateCallback('recording')
      })

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /stop recording/i })).toBeInTheDocument()
      })

      fireEvent.click(screen.getByRole('button', { name: /stop recording/i }))

      expect(mockRecorder.service.stopRecording).toHaveBeenCalled()
    })
  })

  describe('upload progress', () => {
    it('shows upload progress indicator during upload', async () => {
      // Create a delayed uploader to keep upload in progress
      let resolveUpload: () => void
      const delayedUploader = {
        ...createMockUploader(),
        uploadChunk: vi.fn(
          () =>
            new Promise<void>((resolve) => {
              resolveUpload = resolve
            }),
        ),
      }

      render(<RecordingPage recorderService={mockRecorder.service} uploader={delayedUploader} />)

      // Change to recording state and then stop
      act(() => {
        mockRecorder.stateCallback('recording')
      })

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /stop recording/i })).toBeInTheDocument()
      })

      fireEvent.click(screen.getByRole('button', { name: /stop recording/i }))

      // Wait for upload progress to appear
      await waitFor(() => {
        expect(screen.queryByTestId('upload-progress')).toBeInTheDocument()
      })

      // Resolve the upload
      resolveUpload?.()
    })

    it('hides progress indicator after upload completes', async () => {
      render(<RecordingPage recorderService={mockRecorder.service} uploader={mockUploader} />)

      // Trigger recording and stop
      act(() => {
        mockRecorder.stateCallback('recording')
      })

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /stop recording/i })).toBeInTheDocument()
      })

      fireEvent.click(screen.getByRole('button', { name: /stop recording/i }))

      // Wait for upload to complete and progress to disappear
      await waitFor(() => {
        expect(screen.queryByTestId('upload-progress')).not.toBeInTheDocument()
      })
    })
  })

  describe('feedback', () => {
    it('shows success feedback after successful upload', async () => {
      render(<RecordingPage recorderService={mockRecorder.service} uploader={mockUploader} />)

      // Trigger recording and stop
      act(() => {
        mockRecorder.stateCallback('recording')
      })

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /stop recording/i })).toBeInTheDocument()
      })

      fireEvent.click(screen.getByRole('button', { name: /stop recording/i }))

      // Wait for success feedback
      await waitFor(() => {
        expect(screen.getByTestId('success-feedback')).toBeInTheDocument()
      })
    })

    it('shows error feedback when upload fails', async () => {
      const failingUploader = {
        ...createMockUploader(),
        finalizeUpload: vi.fn(() => Promise.reject(new Error('Upload failed'))),
      }

      render(<RecordingPage recorderService={mockRecorder.service} uploader={failingUploader} />)

      // Trigger recording and stop
      act(() => {
        mockRecorder.stateCallback('recording')
      })

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /stop recording/i })).toBeInTheDocument()
      })

      fireEvent.click(screen.getByRole('button', { name: /stop recording/i }))

      // Wait for error feedback
      await waitFor(() => {
        expect(screen.getByTestId('error-feedback')).toBeInTheDocument()
      })
    })

    it('disables start button during upload', async () => {
      // Create a delayed uploader
      const delayedUploader: Uploader = {
        ...createMockUploader(),
        finalizeUpload: vi.fn(() => new Promise(() => {})), // Never resolves
      }

      render(<RecordingPage recorderService={mockRecorder.service} uploader={delayedUploader} />)

      // Trigger recording and stop
      act(() => {
        mockRecorder.stateCallback('recording')
      })

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /stop recording/i })).toBeInTheDocument()
      })

      fireEvent.click(screen.getByRole('button', { name: /stop recording/i }))

      // Wait for state to go back to idle
      act(() => {
        mockRecorder.stateCallback('idle')
      })

      await waitFor(() => {
        const startButton = screen.getByRole('button', { name: /start recording/i })
        expect(startButton).toBeDisabled()
      })
    })
  })
})
