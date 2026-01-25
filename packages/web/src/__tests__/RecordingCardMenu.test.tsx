import type { Recording } from '@just-recordings/shared'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

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
  getRecordings: vi.fn(),
  getThumbnailUrl: vi.fn(),
  deleteRecording: vi.fn(),
  updateRecording: vi.fn(),
}))

import { deleteRecording, getRecordings, updateRecording } from '../api/recordings'
import Home from '../pages/Home.Web'
import RenderModal from '../sharedComponents/Modal'

const mockGetRecordings = vi.mocked(getRecordings)
const mockDeleteRecording = vi.mocked(deleteRecording)
const mockUpdateRecording = vi.mocked(updateRecording)

// Helper to create mock recording
function createMockRecording(overrides: Partial<Recording> = {}): Recording {
  return {
    id: 'test-id',
    name: 'Test Recording',
    mimeType: 'video/webm',
    duration: 90000,
    createdAt: '2026-01-15T10:00:00Z',
    fileSize: 1024 * 1024 * 2.5,
    videoUrl: 'https://res.cloudinary.com/test/video/upload/test.webm',
    videoPublicId: 'test',
    ...overrides,
  }
}

// Create mock recorder service
const createMockRecorderService = () => ({
  acquireScreen: vi.fn(() =>
    Promise.resolve({
      stream: { getTracks: () => [] },
      release: vi.fn(),
    }),
  ),
  startScreenRecording: vi.fn(() => Promise.resolve()),
  stopRecording: vi.fn(() => Promise.resolve()),
  pauseRecording: vi.fn(),
  resumeRecording: vi.fn(),
  cancelRecording: vi.fn(),
  getElapsedTime: vi.fn(() => 0),
  onStateChange: vi.fn(() => () => {}),
  onStreamEnded: vi.fn(() => () => {}),
  getState: vi.fn(() => 'idle'),
})

// Create mock upload manager
const createMockUploadManager = () => ({
  enqueue: vi.fn(() => Promise.resolve()),
  onQueueChange: vi.fn(() => () => {}),
  getQueue: vi.fn(() => Promise.resolve([])),
})

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })
}

describe('RecordingCard Menu', () => {
  let mockRecorderService: ReturnType<typeof createMockRecorderService>
  let mockUploadManager: ReturnType<typeof createMockUploadManager>

  beforeEach(() => {
    vi.clearAllMocks()
    mockRecorderService = createMockRecorderService()
    mockUploadManager = createMockUploadManager()
    mockGetRecordings.mockResolvedValue({
      success: true,
      data: [createMockRecording({ id: 'rec-1', name: 'Recording 1' })],
    })
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
          <RenderModal />
        </MemoryRouter>
      </QueryClientProvider>,
    )
  }

  describe('menu button', () => {
    it('displays three-dot menu button on recording cards', async () => {
      renderHome()

      await waitFor(() => {
        expect(screen.getByTestId('recording-card-menu-button-rec-1')).toBeInTheDocument()
      })
    })

    it('clicking menu button does not navigate to recording', async () => {
      renderHome()

      await waitFor(() => {
        expect(screen.getByTestId('recording-card-menu-button-rec-1')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByTestId('recording-card-menu-button-rec-1'))

      // Should still be on home page (menu should open, not navigate)
      await waitFor(() => {
        expect(screen.getByTestId('recording-card-menu-rec-1')).toBeInTheDocument()
      })
    })
  })

  describe('menu options', () => {
    it('opens menu with Share, Edit Title, and Delete options', async () => {
      renderHome()

      await waitFor(() => {
        expect(screen.getByTestId('recording-card-menu-button-rec-1')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByTestId('recording-card-menu-button-rec-1'))

      await waitFor(() => {
        expect(screen.getByRole('menuitem', { name: /share/i })).toBeInTheDocument()
        expect(screen.getByRole('menuitem', { name: /edit title/i })).toBeInTheDocument()
        expect(screen.getByRole('menuitem', { name: /delete/i })).toBeInTheDocument()
      })
    })

    it('closes menu after selecting an action', async () => {
      renderHome()

      await waitFor(() => {
        expect(screen.getByTestId('recording-card-menu-button-rec-1')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByTestId('recording-card-menu-button-rec-1'))

      await waitFor(() => {
        expect(screen.getByRole('menuitem', { name: /share/i })).toBeInTheDocument()
      })

      fireEvent.click(screen.getByRole('menuitem', { name: /share/i }))

      await waitFor(() => {
        expect(screen.queryByTestId('recording-card-menu-rec-1')).not.toBeInTheDocument()
      })
    })
  })

  describe('share action', () => {
    it('opens share modal when Share is clicked', async () => {
      renderHome()

      await waitFor(() => {
        expect(screen.getByTestId('recording-card-menu-button-rec-1')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByTestId('recording-card-menu-button-rec-1'))

      await waitFor(() => {
        expect(screen.getByRole('menuitem', { name: /share/i })).toBeInTheDocument()
      })

      fireEvent.click(screen.getByRole('menuitem', { name: /share/i }))

      await waitFor(() => {
        expect(screen.getByTestId('share-modal')).toBeInTheDocument()
      })
    })
  })

  describe('edit title action', () => {
    it('opens edit dialog when Edit Title is clicked', async () => {
      renderHome()

      await waitFor(() => {
        expect(screen.getByTestId('recording-card-menu-button-rec-1')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByTestId('recording-card-menu-button-rec-1'))

      await waitFor(() => {
        expect(screen.getByRole('menuitem', { name: /edit title/i })).toBeInTheDocument()
      })

      fireEvent.click(screen.getByRole('menuitem', { name: /edit title/i }))

      await waitFor(() => {
        expect(screen.getByTestId('edit-title-dialog')).toBeInTheDocument()
      })
    })

    it('populates input with current recording name', async () => {
      renderHome()

      await waitFor(() => {
        expect(screen.getByTestId('recording-card-menu-button-rec-1')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByTestId('recording-card-menu-button-rec-1'))
      await waitFor(() => {
        expect(screen.getByRole('menuitem', { name: /edit title/i })).toBeInTheDocument()
      })
      fireEvent.click(screen.getByRole('menuitem', { name: /edit title/i }))

      await waitFor(() => {
        const input = screen.getByTestId('edit-title-input')
        expect(input).toHaveValue('Recording 1')
      })
    })

    it('calls updateRecording API when saving', async () => {
      mockUpdateRecording.mockResolvedValue({
        success: true,
        data: createMockRecording({ id: 'rec-1', name: 'New Name' }),
      })

      renderHome()

      await waitFor(() => {
        expect(screen.getByTestId('recording-card-menu-button-rec-1')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByTestId('recording-card-menu-button-rec-1'))
      await waitFor(() => {
        expect(screen.getByRole('menuitem', { name: /edit title/i })).toBeInTheDocument()
      })
      fireEvent.click(screen.getByRole('menuitem', { name: /edit title/i }))

      await waitFor(() => {
        expect(screen.getByTestId('edit-title-input')).toBeInTheDocument()
      })

      fireEvent.change(screen.getByTestId('edit-title-input'), { target: { value: 'New Name' } })
      fireEvent.click(screen.getByRole('button', { name: /save/i }))

      await waitFor(() => {
        expect(mockUpdateRecording).toHaveBeenCalledWith('rec-1', { name: 'New Name' })
      })
    })
  })

  describe('delete action', () => {
    it('shows confirmation dialog when Delete is clicked', async () => {
      renderHome()

      await waitFor(() => {
        expect(screen.getByTestId('recording-card-menu-button-rec-1')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByTestId('recording-card-menu-button-rec-1'))

      await waitFor(() => {
        expect(screen.getByRole('menuitem', { name: /delete/i })).toBeInTheDocument()
      })

      fireEvent.click(screen.getByRole('menuitem', { name: /delete/i }))

      await waitFor(() => {
        expect(screen.getByTestId('delete-confirmation-dialog')).toBeInTheDocument()
      })
    })

    it('calls deleteRecording API when confirmed', async () => {
      mockDeleteRecording.mockResolvedValue({ success: true, data: { deleted: true } })

      renderHome()

      await waitFor(() => {
        expect(screen.getByTestId('recording-card-menu-button-rec-1')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByTestId('recording-card-menu-button-rec-1'))
      await waitFor(() => {
        expect(screen.getByRole('menuitem', { name: /delete/i })).toBeInTheDocument()
      })
      fireEvent.click(screen.getByRole('menuitem', { name: /delete/i }))

      await waitFor(() => {
        expect(screen.getByTestId('delete-confirmation-dialog')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByRole('button', { name: /confirm/i }))

      await waitFor(() => {
        expect(mockDeleteRecording).toHaveBeenCalledWith('rec-1')
      })
    })

    it('does not delete when cancel is clicked', async () => {
      renderHome()

      await waitFor(() => {
        expect(screen.getByTestId('recording-card-menu-button-rec-1')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByTestId('recording-card-menu-button-rec-1'))
      await waitFor(() => {
        expect(screen.getByRole('menuitem', { name: /delete/i })).toBeInTheDocument()
      })
      fireEvent.click(screen.getByRole('menuitem', { name: /delete/i }))

      await waitFor(() => {
        expect(screen.getByTestId('delete-confirmation-dialog')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByRole('button', { name: /cancel/i }))

      await waitFor(() => {
        expect(screen.queryByTestId('delete-confirmation-dialog')).not.toBeInTheDocument()
      })
      expect(mockDeleteRecording).not.toHaveBeenCalled()
    })
  })
})
