import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Mock the electron module
vi.mock('../utils/electron', () => ({
  setRecordingState: vi.fn(),
  isElectron: vi.fn(() => true),
  isElectronCheck: vi.fn(() => true),
  countdownStart: vi.fn(),
  countdownTick: vi.fn(),
  countdownEnd: vi.fn(),
}))

import Home from '../pages/Home/Desktop'

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

describe('Home.Desktop - Recording Naming Flow', () => {
  let mockRecorderService: ReturnType<typeof createMockRecorderService>
  let mockUploadManager: ReturnType<typeof createMockUploadManager>

  beforeEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
    localStorage.clear()
    // Mark setup as complete so we skip the wizard
    localStorage.setItem('just-recordings-setup-complete', 'true')
    mockRecorderService = createMockRecorderService()
    mockUploadManager = createMockUploadManager()

    // Mock window.api for Electron environment
    ;(window as { api?: unknown }).api = {
      openSystemPreferences: vi.fn(),
      setRecordingState: vi.fn(),
      setSetupMode: vi.fn(),
      getVersions: vi.fn(),
      showFloatingControls: vi.fn(),
      hideFloatingControls: vi.fn(),
      updateRecordingState: vi.fn(),
      onFloatingControlAction: vi.fn(() => () => {}),
    }
  })

  afterEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    delete (window as { api?: unknown }).api
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

  // Helper to start a recording and get to recording state
  const startRecording = async () => {
    // Settings modal auto-opens on desktop when idle
    // Wait for it to appear
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /start recording/i })).toBeInTheDocument()
    })

    // Start recording from settings modal
    fireEvent.click(screen.getByRole('button', { name: /start recording/i }))

    // Wait for recording controls modal to appear (after countdown)
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
