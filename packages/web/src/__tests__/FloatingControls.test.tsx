import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import FloatingControls, { type RecordingState } from '../pages/FloatingControls'

// Mock window.api for Electron IPC
const mockOnRecordingStateUpdate = vi.fn()
const mockSendFloatingControlAction = vi.fn()

// Mock MediaDevices API
const mockGetUserMedia = vi.fn()
const mockMediaStream = {
  getTracks: vi.fn(() => [{ stop: vi.fn() }]),
}

beforeEach(() => {
  // Set up window.api mock
  window.api = {
    onRecordingStateUpdate: mockOnRecordingStateUpdate,
    sendFloatingControlAction: mockSendFloatingControlAction,
  } as unknown as typeof window.api

  // Set up MediaDevices mock
  Object.defineProperty(navigator, 'mediaDevices', {
    value: { getUserMedia: mockGetUserMedia },
    configurable: true,
  })
  mockGetUserMedia.mockResolvedValue(mockMediaStream)
})

afterEach(() => {
  vi.clearAllMocks()
  // Clean up window.api
  delete (window as { api?: unknown }).api
})

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<MemoryRouter>{ui}</MemoryRouter>)
}

function createRecordingState(overrides: Partial<RecordingState> = {}): RecordingState {
  return {
    status: 'recording',
    elapsedTimeMs: 0,
    webcamEnabled: false,
    ...overrides,
  }
}

describe('FloatingControls', () => {
  describe('initial state', () => {
    it('shows loading state when no recording state received', () => {
      mockOnRecordingStateUpdate.mockReturnValue(() => {})

      renderWithRouter(<FloatingControls />)

      expect(screen.getByTestId('floating-controls-loading')).toBeInTheDocument()
    })

    it('displays waiting message in loading state', () => {
      mockOnRecordingStateUpdate.mockReturnValue(() => {})

      renderWithRouter(<FloatingControls />)

      expect(screen.getByText(/waiting for recording state/i)).toBeInTheDocument()
    })
  })

  describe('with recording state', () => {
    it('renders controls when state is provided via props', () => {
      const state = createRecordingState()

      renderWithRouter(<FloatingControls initialState={state} />)

      expect(screen.getByTestId('floating-controls')).toBeInTheDocument()
    })

    it('displays recording status when recording', () => {
      const state = createRecordingState({ status: 'recording' })

      renderWithRouter(<FloatingControls initialState={state} />)

      expect(screen.getByTestId('state-indicator')).toHaveTextContent('Recording')
    })

    it('displays paused status when paused', () => {
      const state = createRecordingState({ status: 'paused' })

      renderWithRouter(<FloatingControls initialState={state} />)

      expect(screen.getByTestId('state-indicator')).toHaveTextContent('Paused')
    })

    it('displays elapsed time in formatted form', () => {
      const state = createRecordingState({ elapsedTimeMs: 5000 })

      renderWithRouter(<FloatingControls initialState={state} />)

      // 5000ms = 00:05
      expect(screen.getByTestId('elapsed-time')).toHaveTextContent('00:05')
    })
  })

  describe('IPC integration', () => {
    it('subscribes to recording state updates on mount', () => {
      mockOnRecordingStateUpdate.mockReturnValue(() => {})

      renderWithRouter(<FloatingControls />)

      expect(mockOnRecordingStateUpdate).toHaveBeenCalled()
    })

    it('updates state when IPC event received', async () => {
      let stateCallback: ((state: RecordingState) => void) | null = null
      mockOnRecordingStateUpdate.mockImplementation((cb) => {
        stateCallback = cb
        return () => {}
      })

      renderWithRouter(<FloatingControls />)

      // Initially in loading state
      expect(screen.getByTestId('floating-controls-loading')).toBeInTheDocument()

      // Simulate IPC event
      stateCallback?.(createRecordingState({ status: 'recording', elapsedTimeMs: 1000 }))

      // Should now show controls
      await waitFor(() => {
        expect(screen.getByTestId('floating-controls')).toBeInTheDocument()
      })
    })

    it('cleans up subscription on unmount', () => {
      const cleanup = vi.fn()
      mockOnRecordingStateUpdate.mockReturnValue(cleanup)

      const { unmount } = renderWithRouter(<FloatingControls />)
      unmount()

      expect(cleanup).toHaveBeenCalled()
    })
  })

  describe('webcam preview', () => {
    it('shows webcam preview when webcamEnabled is true', async () => {
      const state = createRecordingState({ webcamEnabled: true })

      renderWithRouter(<FloatingControls initialState={state} />)

      await waitFor(() => {
        expect(screen.getByTestId('webcam-preview')).toBeInTheDocument()
      })
    })

    it('does not show webcam preview when webcamEnabled is false', () => {
      const state = createRecordingState({ webcamEnabled: false })

      renderWithRouter(<FloatingControls initialState={state} />)

      expect(screen.queryByTestId('webcam-preview')).not.toBeInTheDocument()
    })

    it('requests webcam stream when webcamEnabled is true', async () => {
      const state = createRecordingState({ webcamEnabled: true })

      renderWithRouter(<FloatingControls initialState={state} />)

      await waitFor(() => {
        expect(mockGetUserMedia).toHaveBeenCalledWith({
          video: true,
          audio: false,
        })
      })
    })

    it('contains video element with correct attributes', async () => {
      const state = createRecordingState({ webcamEnabled: true })

      renderWithRouter(<FloatingControls initialState={state} />)

      await waitFor(() => {
        const video = screen.getByTestId('webcam-preview').querySelector('video')
        expect(video).toBeInTheDocument()
        expect(video).toHaveAttribute('autoplay')
        expect(video).toHaveAttribute('playsinline')
      })
    })
  })
})
