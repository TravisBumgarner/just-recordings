import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Home from '../pages/Home.Desktop'

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
  onStateChange: vi.fn(() => () => {}),
  getState: vi.fn(() => 'idle'),
})

// Create mock upload manager
const createMockUploadManager = () => ({
  enqueue: vi.fn(() => Promise.resolve()),
  onQueueChange: vi.fn(() => () => {}),
  getQueue: vi.fn(() => Promise.resolve([])),
})

describe('Home.Desktop - SetupWizard integration', () => {
  let mockRecorderService: ReturnType<typeof createMockRecorderService>
  let mockUploadManager: ReturnType<typeof createMockUploadManager>
  const mockOpenSystemPreferences = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    mockRecorderService = createMockRecorderService()
    mockUploadManager = createMockUploadManager()

    // Mock window.api for Electron environment
    ;(window as { api?: unknown }).api = {
      openSystemPreferences: mockOpenSystemPreferences,
      setRecordingState: vi.fn(),
      setSetupMode: vi.fn(),
      getVersions: vi.fn(),
      // Floating window IPC methods
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

  describe('first launch', () => {
    it('shows SetupWizard on first desktop app launch', () => {
      renderHome()

      expect(screen.getByTestId('setup-wizard')).toBeInTheDocument()
    })

    it('does not show main recording UI during wizard', () => {
      renderHome()

      expect(screen.queryByRole('button', { name: /start recording/i })).not.toBeInTheDocument()
    })
  })

  describe('wizard completion', () => {
    it('shows normal Home screen after completing wizard', async () => {
      renderHome()

      // Complete the wizard (welcome -> screenRecording -> microphone -> complete)
      fireEvent.click(screen.getByRole('button', { name: /next/i }))
      fireEvent.click(screen.getByRole('button', { name: /next/i }))
      fireEvent.click(screen.getByRole('button', { name: /next/i }))
      fireEvent.click(screen.getByRole('button', { name: /get started/i }))

      await waitFor(() => {
        expect(screen.queryByTestId('setup-wizard')).not.toBeInTheDocument()
      })

      expect(screen.getByRole('button', { name: /start recording/i })).toBeInTheDocument()
    })
  })

  describe('subsequent launches', () => {
    it('skips the wizard when setup is already complete', () => {
      localStorage.setItem('just-recordings-setup-complete', 'true')

      renderHome()

      expect(screen.queryByTestId('setup-wizard')).not.toBeInTheDocument()
      expect(screen.getByRole('button', { name: /start recording/i })).toBeInTheDocument()
    })
  })
})
