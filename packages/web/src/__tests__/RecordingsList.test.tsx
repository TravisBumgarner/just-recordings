import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import RecordingsListPage from '../pages/RecordingsList';
import type { RecorderService, Recording } from '@just-recordings/recorder';

// Helper to create mock recordings
function createMockRecording(overrides: Partial<Recording> = {}): Recording {
  return {
    id: 1,
    name: 'Test Recording',
    blob: new Blob(['test'], { type: 'video/webm' }),
    mimeType: 'video/webm',
    duration: 60000, // 1 minute in ms
    createdAt: new Date('2026-01-15T10:00:00'),
    fileSize: 1024 * 1024, // 1 MB
    ...overrides,
  };
}

// Mock RecorderService
function createMockRecorderService(recordings: Recording[] = []): RecorderService {
  return {
    getState: vi.fn(() => 'idle'),
    onStateChange: vi.fn(() => vi.fn()),
    startScreenRecording: vi.fn(),
    stopRecording: vi.fn(),
    pauseRecording: vi.fn(),
    resumeRecording: vi.fn(),
    saveRecording: vi.fn(),
    getRecording: vi.fn(),
    getAllRecordings: vi.fn(() => Promise.resolve(recordings)),
    deleteRecording: vi.fn(),
  } as unknown as RecorderService;
}

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
};

describe('RecordingsListPage', () => {
  let mockRecorderService: RecorderService;

  beforeEach(() => {
    mockRecorderService = createMockRecorderService();
  });

  describe('loading state', () => {
    it('shows loading indicator while fetching recordings', () => {
      // Create a service that never resolves
      const slowService = {
        ...createMockRecorderService(),
        getAllRecordings: vi.fn(() => new Promise(() => {})),
      } as unknown as RecorderService;

      renderWithRouter(
        <RecordingsListPage recorderService={slowService} />
      );

      expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
    });
  });

  describe('empty state', () => {
    it('shows empty state when no recordings exist', async () => {
      renderWithRouter(
        <RecordingsListPage recorderService={mockRecorderService} />
      );

      await waitFor(() => {
        expect(screen.getByTestId('empty-state')).toBeInTheDocument();
      });
    });

    it('displays helpful message in empty state', async () => {
      renderWithRouter(
        <RecordingsListPage recorderService={mockRecorderService} />
      );

      await waitFor(() => {
        expect(screen.getByText(/no recordings/i)).toBeInTheDocument();
      });
    });
  });

  describe('recordings grid', () => {
    it('displays recordings in a grid', async () => {
      const recordings = [
        createMockRecording({ id: 1, name: 'Recording 1' }),
        createMockRecording({ id: 2, name: 'Recording 2' }),
      ];
      mockRecorderService = createMockRecorderService(recordings);

      renderWithRouter(
        <RecordingsListPage recorderService={mockRecorderService} />
      );

      await waitFor(() => {
        expect(screen.getByText('Recording 1')).toBeInTheDocument();
        expect(screen.getByText('Recording 2')).toBeInTheDocument();
      });
    });

    it('shows recording duration on card', async () => {
      const recordings = [
        createMockRecording({ id: 1, name: 'Test', duration: 90000 }), // 1:30
      ];
      mockRecorderService = createMockRecorderService(recordings);

      renderWithRouter(
        <RecordingsListPage recorderService={mockRecorderService} />
      );

      await waitFor(() => {
        expect(screen.getByText(/1:30/)).toBeInTheDocument();
      });
    });

    it('shows recording creation date on card', async () => {
      const recordings = [
        createMockRecording({
          id: 1,
          name: 'Test',
          createdAt: new Date('2026-01-15T10:00:00'),
        }),
      ];
      mockRecorderService = createMockRecorderService(recordings);

      renderWithRouter(
        <RecordingsListPage recorderService={mockRecorderService} />
      );

      await waitFor(() => {
        // Check for date in some format
        expect(screen.getByText(/jan.*15/i)).toBeInTheDocument();
      });
    });

    it('shows recording file size on card', async () => {
      const recordings = [
        createMockRecording({
          id: 1,
          name: 'Test',
          fileSize: 1024 * 1024 * 2.5, // 2.5 MB
        }),
      ];
      mockRecorderService = createMockRecorderService(recordings);

      renderWithRouter(
        <RecordingsListPage recorderService={mockRecorderService} />
      );

      await waitFor(() => {
        expect(screen.getByText(/2\.5.*mb/i)).toBeInTheDocument();
      });
    });
  });

  describe('navigation', () => {
    it('recording cards are clickable links', async () => {
      const recordings = [
        createMockRecording({ id: 42, name: 'Clickable Recording' }),
      ];
      mockRecorderService = createMockRecorderService(recordings);

      renderWithRouter(
        <RecordingsListPage recorderService={mockRecorderService} />
      );

      await waitFor(() => {
        const link = screen.getByRole('link', { name: /clickable recording/i });
        expect(link).toHaveAttribute('href', '/recordings/42');
      });
    });
  });

  describe('fetching recordings', () => {
    it('calls getAllRecordings on mount', async () => {
      renderWithRouter(
        <RecordingsListPage recorderService={mockRecorderService} />
      );

      await waitFor(() => {
        expect(mockRecorderService.getAllRecordings).toHaveBeenCalled();
      });
    });
  });
});
