import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import RecordingViewerPage from '../pages/RecordingViewer';
import type { RecorderService, Recording } from '@just-recordings/recorder';

// Helper to create mock recording
function createMockRecording(overrides: Partial<Recording> = {}): Recording {
  return {
    id: 1,
    name: 'Test Recording',
    blob: new Blob(['test video content'], { type: 'video/webm' }),
    mimeType: 'video/webm',
    duration: 90000, // 1:30
    createdAt: new Date('2026-01-15T10:00:00'),
    fileSize: 1024 * 1024 * 2.5, // 2.5 MB
    ...overrides,
  };
}

// Mock RecorderService
function createMockRecorderService(recording?: Recording): RecorderService {
  return {
    getState: vi.fn(() => 'idle'),
    onStateChange: vi.fn(() => vi.fn()),
    startScreenRecording: vi.fn(),
    stopRecording: vi.fn(),
    pauseRecording: vi.fn(),
    resumeRecording: vi.fn(),
    saveRecording: vi.fn(),
    getRecording: vi.fn((id: number) => Promise.resolve(recording)),
    getAllRecordings: vi.fn(),
    deleteRecording: vi.fn(() => Promise.resolve()),
  } as unknown as RecorderService;
}

// Render with router at specific path
function renderAtPath(
  ui: React.ReactElement,
  path: string,
  initialEntries: string[]
) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path={path} element={ui} />
        <Route path="/recordings" element={<div>Recordings List</div>} />
      </Routes>
    </MemoryRouter>
  );
}

// Mock URL.createObjectURL and revokeObjectURL
const mockCreateObjectURL = vi.fn(() => 'blob:mock-url');
const mockRevokeObjectURL = vi.fn();

describe('RecordingViewerPage', () => {
  let mockRecorderService: RecorderService;

  beforeEach(() => {
    mockRecorderService = createMockRecorderService(createMockRecording());
    global.URL.createObjectURL = mockCreateObjectURL;
    global.URL.revokeObjectURL = mockRevokeObjectURL;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('loading state', () => {
    it('shows loading indicator while fetching recording', () => {
      const slowService = {
        ...createMockRecorderService(),
        getRecording: vi.fn(() => new Promise(() => {})),
      } as unknown as RecorderService;

      renderAtPath(
        <RecordingViewerPage recorderService={slowService} />,
        '/recordings/:id',
        ['/recordings/1']
      );

      expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
    });
  });

  describe('error state', () => {
    it('shows error when recording not found', async () => {
      const serviceWithNoRecording = createMockRecorderService(undefined);

      renderAtPath(
        <RecordingViewerPage recorderService={serviceWithNoRecording} />,
        '/recordings/:id',
        ['/recordings/999']
      );

      await waitFor(() => {
        expect(screen.getByTestId('error-state')).toBeInTheDocument();
      });
    });

    it('displays not found message', async () => {
      const serviceWithNoRecording = createMockRecorderService(undefined);

      renderAtPath(
        <RecordingViewerPage recorderService={serviceWithNoRecording} />,
        '/recordings/:id',
        ['/recordings/999']
      );

      await waitFor(() => {
        expect(screen.getByText(/not found/i)).toBeInTheDocument();
      });
    });
  });

  describe('video player', () => {
    it('displays video element with recording blob', async () => {
      renderAtPath(
        <RecordingViewerPage recorderService={mockRecorderService} />,
        '/recordings/:id',
        ['/recordings/1']
      );

      await waitFor(() => {
        const video = screen.getByTestId('video-player');
        expect(video).toBeInTheDocument();
        expect(video).toHaveAttribute('src', 'blob:mock-url');
      });
    });

    it('creates object URL from recording blob', async () => {
      renderAtPath(
        <RecordingViewerPage recorderService={mockRecorderService} />,
        '/recordings/:id',
        ['/recordings/1']
      );

      await waitFor(() => {
        expect(mockCreateObjectURL).toHaveBeenCalled();
      });
    });
  });

  describe('recording metadata', () => {
    it('displays recording name', async () => {
      renderAtPath(
        <RecordingViewerPage recorderService={mockRecorderService} />,
        '/recordings/:id',
        ['/recordings/1']
      );

      await waitFor(() => {
        expect(screen.getByText('Test Recording')).toBeInTheDocument();
      });
    });

    it('displays recording duration', async () => {
      renderAtPath(
        <RecordingViewerPage recorderService={mockRecorderService} />,
        '/recordings/:id',
        ['/recordings/1']
      );

      await waitFor(() => {
        expect(screen.getByText(/1:30/)).toBeInTheDocument();
      });
    });

    it('displays recording date', async () => {
      renderAtPath(
        <RecordingViewerPage recorderService={mockRecorderService} />,
        '/recordings/:id',
        ['/recordings/1']
      );

      await waitFor(() => {
        expect(screen.getByText(/jan.*15/i)).toBeInTheDocument();
      });
    });

    it('displays recording file size', async () => {
      renderAtPath(
        <RecordingViewerPage recorderService={mockRecorderService} />,
        '/recordings/:id',
        ['/recordings/1']
      );

      await waitFor(() => {
        expect(screen.getByText(/2\.5.*mb/i)).toBeInTheDocument();
      });
    });
  });

  describe('navigation', () => {
    it('has back link to recordings list', async () => {
      renderAtPath(
        <RecordingViewerPage recorderService={mockRecorderService} />,
        '/recordings/:id',
        ['/recordings/1']
      );

      await waitFor(() => {
        const backLink = screen.getByRole('link', { name: /back/i });
        expect(backLink).toHaveAttribute('href', '/recordings');
      });
    });
  });

  describe('fetching recording', () => {
    it('calls getRecording with ID from URL', async () => {
      renderAtPath(
        <RecordingViewerPage recorderService={mockRecorderService} />,
        '/recordings/:id',
        ['/recordings/42']
      );

      await waitFor(() => {
        expect(mockRecorderService.getRecording).toHaveBeenCalledWith(42);
      });
    });
  });

  describe('delete functionality', () => {
    it('has delete button', async () => {
      renderAtPath(
        <RecordingViewerPage recorderService={mockRecorderService} />,
        '/recordings/:id',
        ['/recordings/1']
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
      });
    });

    it('shows confirmation dialog when delete clicked', async () => {
      renderAtPath(
        <RecordingViewerPage recorderService={mockRecorderService} />,
        '/recordings/:id',
        ['/recordings/1']
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /delete/i }));

      await waitFor(() => {
        expect(screen.getByTestId('delete-confirmation')).toBeInTheDocument();
      });
    });

    it('calls deleteRecording when confirmed', async () => {
      renderAtPath(
        <RecordingViewerPage recorderService={mockRecorderService} />,
        '/recordings/:id',
        ['/recordings/1']
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /delete/i }));

      await waitFor(() => {
        expect(screen.getByTestId('delete-confirmation')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /confirm/i }));

      await waitFor(() => {
        expect(mockRecorderService.deleteRecording).toHaveBeenCalledWith(1);
      });
    });

    it('navigates to recordings list after deletion', async () => {
      renderAtPath(
        <RecordingViewerPage recorderService={mockRecorderService} />,
        '/recordings/:id',
        ['/recordings/1']
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /delete/i }));

      await waitFor(() => {
        expect(screen.getByTestId('delete-confirmation')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /confirm/i }));

      await waitFor(() => {
        expect(screen.getByText('Recordings List')).toBeInTheDocument();
      });
    });
  });
});
