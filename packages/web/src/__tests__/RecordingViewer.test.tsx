import type { Recording } from '@just-recordings/shared'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import RecordingViewerPage from '../pages/RecordingViewer'

// Mock the API module
vi.mock('../api/recordings', () => ({
  getRecording: vi.fn(),
  getVideoUrl: vi.fn(),
  deleteRecording: vi.fn(),
}))

import { deleteRecording, getRecording, getVideoUrl } from '../api/recordings'

const mockGetRecording = vi.mocked(getRecording)
const mockGetVideoUrl = vi.mocked(getVideoUrl)
const mockDeleteRecording = vi.mocked(deleteRecording)

// Helper to create mock recording
function createMockRecording(overrides: Partial<Recording> = {}): Recording {
  return {
    id: 'test-id',
    name: 'Test Recording',
    mimeType: 'video/webm',
    duration: 90000, // 1:30
    createdAt: '2026-01-15T10:00:00Z',
    fileSize: 1024 * 1024 * 2.5, // 2.5 MB
    videoUrl: 'https://res.cloudinary.com/test/video/upload/test.webm',
    videoPublicId: 'test',
    ...overrides,
  }
}

// Create a fresh QueryClient for each test
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })
}

// Render with router at specific path
function renderAtPath(ui: React.ReactElement, path: string, initialEntries: string[]) {
  const queryClient = createTestQueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route path={path} element={ui} />
          <Route path="/" element={<div>Home</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('RecordingViewerPage', () => {
  beforeEach(() => {
    mockGetRecording.mockReset()
    mockDeleteRecording.mockReset()
    mockGetVideoUrl.mockReset()
    // Default video URL mock
    mockGetVideoUrl.mockImplementation((id: string) =>
      Promise.resolve({ success: true, data: `/api/recordings/${id}/video` })
    )
  })

  describe('loading state', () => {
    it('shows loading indicator while fetching recording', () => {
      mockGetRecording.mockImplementation(() => new Promise(() => {}))

      renderAtPath(<RecordingViewerPage />, '/recordings/:id', ['/recordings/test-id'])

      expect(screen.getByTestId('loading-indicator')).toBeInTheDocument()
    })
  })

  describe('error state', () => {
    it('shows error when recording not found', async () => {
      mockGetRecording.mockResolvedValue({ success: false, errorCode: 'RECORDING_NOT_FOUND' })

      renderAtPath(<RecordingViewerPage />, '/recordings/:id', ['/recordings/nonexistent'])

      await waitFor(() => {
        expect(screen.getByTestId('error-state')).toBeInTheDocument()
      })
    })

    it('displays not found message', async () => {
      mockGetRecording.mockResolvedValue({ success: false, errorCode: 'RECORDING_NOT_FOUND' })

      renderAtPath(<RecordingViewerPage />, '/recordings/:id', ['/recordings/nonexistent'])

      await waitFor(() => {
        expect(screen.getByText(/not found/i)).toBeInTheDocument()
      })
    })
  })

  describe('video player', () => {
    it('displays video element with server URL', async () => {
      mockGetRecording.mockResolvedValue({
        success: true,
        data: createMockRecording({ id: 'video-test' }),
      })

      renderAtPath(<RecordingViewerPage />, '/recordings/:id', ['/recordings/video-test'])

      await waitFor(() => {
        const video = screen.getByTestId('video-player')
        expect(video).toBeInTheDocument()
        expect(video).toHaveAttribute('src', '/api/recordings/video-test/video')
      })
    })

    it('uses getVideoUrl to construct video source', async () => {
      mockGetRecording.mockResolvedValue({
        success: true,
        data: createMockRecording({ id: 'url-test' }),
      })

      renderAtPath(<RecordingViewerPage />, '/recordings/:id', ['/recordings/url-test'])

      await waitFor(() => {
        expect(mockGetVideoUrl).toHaveBeenCalledWith('url-test')
      })
    })
  })

  describe('recording metadata', () => {
    it('displays recording name', async () => {
      mockGetRecording.mockResolvedValue({
        success: true,
        data: createMockRecording({ name: 'My Test Recording' }),
      })

      renderAtPath(<RecordingViewerPage />, '/recordings/:id', ['/recordings/test-id'])

      await waitFor(() => {
        expect(screen.getByText('My Test Recording')).toBeInTheDocument()
      })
    })

    it('displays recording duration', async () => {
      mockGetRecording.mockResolvedValue({
        success: true,
        data: createMockRecording({ duration: 90000 }),
      })

      renderAtPath(<RecordingViewerPage />, '/recordings/:id', ['/recordings/test-id'])

      await waitFor(() => {
        expect(screen.getByText(/1:30/)).toBeInTheDocument()
      })
    })

    it('displays recording date', async () => {
      mockGetRecording.mockResolvedValue({
        success: true,
        data: createMockRecording({ createdAt: '2026-01-15T10:00:00Z' }),
      })

      renderAtPath(<RecordingViewerPage />, '/recordings/:id', ['/recordings/test-id'])

      await waitFor(() => {
        expect(screen.getByText(/jan.*15/i)).toBeInTheDocument()
      })
    })

    it('displays recording file size', async () => {
      mockGetRecording.mockResolvedValue({
        success: true,
        data: createMockRecording({ fileSize: 1024 * 1024 * 2.5 }),
      })

      renderAtPath(<RecordingViewerPage />, '/recordings/:id', ['/recordings/test-id'])

      await waitFor(() => {
        expect(screen.getByText(/2\.5.*mb/i)).toBeInTheDocument()
      })
    })
  })

  describe('navigation', () => {
    it('has back link to home', async () => {
      mockGetRecording.mockResolvedValue({ success: true, data: createMockRecording() })

      renderAtPath(<RecordingViewerPage />, '/recordings/:id', ['/recordings/test-id'])

      await waitFor(() => {
        const backLink = screen.getByRole('link', { name: /back/i })
        expect(backLink).toHaveAttribute('href', '/')
      })
    })
  })

  describe('fetching recording', () => {
    it('calls getRecording API with ID from URL', async () => {
      mockGetRecording.mockResolvedValue({ success: true, data: createMockRecording() })

      renderAtPath(<RecordingViewerPage />, '/recordings/:id', ['/recordings/abc-123'])

      await waitFor(() => {
        expect(mockGetRecording).toHaveBeenCalledWith('abc-123')
      })
    })
  })

  describe('delete functionality', () => {
    it('has delete button', async () => {
      mockGetRecording.mockResolvedValue({ success: true, data: createMockRecording() })

      renderAtPath(<RecordingViewerPage />, '/recordings/:id', ['/recordings/test-id'])

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument()
      })
    })

    it('shows confirmation dialog when delete clicked', async () => {
      mockGetRecording.mockResolvedValue({ success: true, data: createMockRecording() })

      renderAtPath(<RecordingViewerPage />, '/recordings/:id', ['/recordings/test-id'])

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument()
      })

      fireEvent.click(screen.getByRole('button', { name: /delete/i }))

      await waitFor(() => {
        expect(screen.getByTestId('delete-confirmation')).toBeInTheDocument()
      })
    })

    it('calls deleteRecording API when confirmed', async () => {
      mockGetRecording.mockResolvedValue({
        success: true,
        data: createMockRecording({ id: 'delete-test' }),
      })
      mockDeleteRecording.mockResolvedValue({ success: true, data: { deleted: true } })

      renderAtPath(<RecordingViewerPage />, '/recordings/:id', ['/recordings/delete-test'])

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument()
      })

      fireEvent.click(screen.getByRole('button', { name: /delete/i }))

      await waitFor(() => {
        expect(screen.getByTestId('delete-confirmation')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByRole('button', { name: /confirm/i }))

      await waitFor(() => {
        expect(mockDeleteRecording).toHaveBeenCalledWith('delete-test')
      })
    })

    it('navigates to home after deletion', async () => {
      mockGetRecording.mockResolvedValue({ success: true, data: createMockRecording() })
      mockDeleteRecording.mockResolvedValue({ success: true, data: { deleted: true } })

      renderAtPath(<RecordingViewerPage />, '/recordings/:id', ['/recordings/test-id'])

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument()
      })

      fireEvent.click(screen.getByRole('button', { name: /delete/i }))

      await waitFor(() => {
        expect(screen.getByTestId('delete-confirmation')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByRole('button', { name: /confirm/i }))

      await waitFor(() => {
        expect(screen.getByText('Home')).toBeInTheDocument()
      })
    })
  })
})
