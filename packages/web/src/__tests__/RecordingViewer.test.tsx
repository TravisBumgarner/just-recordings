import type { Recording } from '@just-recordings/shared'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import RecordingViewerPage from '../pages/RecordingViewer'

// Mock the API module
vi.mock('../api/recordings', () => ({
  getRecording: vi.fn(),
  getVideoUrl: vi.fn((id: string) => `/api/recordings/${id}/video`),
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
    path: 'uploads/test.webm',
    ...overrides,
  }
}

// Render with router at specific path
function renderAtPath(ui: React.ReactElement, path: string, initialEntries: string[]) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path={path} element={ui} />
        <Route path="/" element={<div>Home</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('RecordingViewerPage', () => {
  beforeEach(() => {
    mockGetRecording.mockReset()
    mockDeleteRecording.mockReset()
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
      mockGetRecording.mockResolvedValue({ success: false, message: 'Recording not found' })

      renderAtPath(<RecordingViewerPage />, '/recordings/:id', ['/recordings/nonexistent'])

      await waitFor(() => {
        expect(screen.getByTestId('error-state')).toBeInTheDocument()
      })
    })

    it('displays not found message', async () => {
      mockGetRecording.mockResolvedValue({ success: false, message: 'Recording not found' })

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
        recording: createMockRecording({ id: 'video-test' }),
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
        recording: createMockRecording({ id: 'url-test' }),
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
        recording: createMockRecording({ name: 'My Test Recording' }),
      })

      renderAtPath(<RecordingViewerPage />, '/recordings/:id', ['/recordings/test-id'])

      await waitFor(() => {
        expect(screen.getByText('My Test Recording')).toBeInTheDocument()
      })
    })

    it('displays recording duration', async () => {
      mockGetRecording.mockResolvedValue({
        success: true,
        recording: createMockRecording({ duration: 90000 }),
      })

      renderAtPath(<RecordingViewerPage />, '/recordings/:id', ['/recordings/test-id'])

      await waitFor(() => {
        expect(screen.getByText(/1:30/)).toBeInTheDocument()
      })
    })

    it('displays recording date', async () => {
      mockGetRecording.mockResolvedValue({
        success: true,
        recording: createMockRecording({ createdAt: '2026-01-15T10:00:00Z' }),
      })

      renderAtPath(<RecordingViewerPage />, '/recordings/:id', ['/recordings/test-id'])

      await waitFor(() => {
        expect(screen.getByText(/jan.*15/i)).toBeInTheDocument()
      })
    })

    it('displays recording file size', async () => {
      mockGetRecording.mockResolvedValue({
        success: true,
        recording: createMockRecording({ fileSize: 1024 * 1024 * 2.5 }),
      })

      renderAtPath(<RecordingViewerPage />, '/recordings/:id', ['/recordings/test-id'])

      await waitFor(() => {
        expect(screen.getByText(/2\.5.*mb/i)).toBeInTheDocument()
      })
    })
  })

  describe('navigation', () => {
    it('has back link to home', async () => {
      mockGetRecording.mockResolvedValue({ success: true, recording: createMockRecording() })

      renderAtPath(<RecordingViewerPage />, '/recordings/:id', ['/recordings/test-id'])

      await waitFor(() => {
        const backLink = screen.getByRole('link', { name: /back/i })
        expect(backLink).toHaveAttribute('href', '/')
      })
    })
  })

  describe('fetching recording', () => {
    it('calls getRecording API with ID from URL', async () => {
      mockGetRecording.mockResolvedValue({ success: true, recording: createMockRecording() })

      renderAtPath(<RecordingViewerPage />, '/recordings/:id', ['/recordings/abc-123'])

      await waitFor(() => {
        expect(mockGetRecording).toHaveBeenCalledWith('abc-123')
      })
    })
  })

  describe('delete functionality', () => {
    it('has delete button', async () => {
      mockGetRecording.mockResolvedValue({ success: true, recording: createMockRecording() })

      renderAtPath(<RecordingViewerPage />, '/recordings/:id', ['/recordings/test-id'])

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument()
      })
    })

    it('shows confirmation dialog when delete clicked', async () => {
      mockGetRecording.mockResolvedValue({ success: true, recording: createMockRecording() })

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
        recording: createMockRecording({ id: 'delete-test' }),
      })
      mockDeleteRecording.mockResolvedValue({ success: true })

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
      mockGetRecording.mockResolvedValue({ success: true, recording: createMockRecording() })
      mockDeleteRecording.mockResolvedValue({ success: true })

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
