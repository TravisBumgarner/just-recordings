import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import RecordingsListPage from '../pages/RecordingsList';
import type { RecordingMetadata } from '../types/api';

// Mock the API module
vi.mock('../services/api', () => ({
  getRecordings: vi.fn(),
  ApiError: class ApiError extends Error {
    constructor(message: string, public statusCode?: number) {
      super(message);
      this.name = 'ApiError';
    }
  },
}));

import { getRecordings, ApiError } from '../services/api';
const mockGetRecordings = vi.mocked(getRecordings);

// Helper to create mock recording metadata
function createMockRecording(overrides: Partial<RecordingMetadata> = {}): RecordingMetadata {
  return {
    id: 'test-id',
    name: 'Test Recording',
    mimeType: 'video/webm',
    duration: 60000, // 1 minute in ms
    createdAt: '2026-01-15T10:00:00Z',
    fileSize: 1024 * 1024, // 1 MB
    path: 'uploads/test.webm',
    ...overrides,
  };
}

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
};

describe('RecordingsListPage', () => {
  beforeEach(() => {
    mockGetRecordings.mockReset();
  });

  describe('loading state', () => {
    it('shows loading indicator while fetching recordings', () => {
      // Create a promise that never resolves
      mockGetRecordings.mockImplementation(() => new Promise(() => {}));

      renderWithRouter(<RecordingsListPage />);

      expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
    });
  });

  describe('empty state', () => {
    it('shows empty state when no recordings exist', async () => {
      mockGetRecordings.mockResolvedValue([]);

      renderWithRouter(<RecordingsListPage />);

      await waitFor(() => {
        expect(screen.getByTestId('empty-state')).toBeInTheDocument();
      });
    });

    it('displays helpful message in empty state', async () => {
      mockGetRecordings.mockResolvedValue([]);

      renderWithRouter(<RecordingsListPage />);

      await waitFor(() => {
        expect(screen.getByText(/no recordings/i)).toBeInTheDocument();
      });
    });
  });

  describe('error state', () => {
    it('shows error state when API fails', async () => {
      mockGetRecordings.mockRejectedValue(new ApiError('Server error', 500));

      renderWithRouter(<RecordingsListPage />);

      await waitFor(() => {
        expect(screen.getByTestId('error-state')).toBeInTheDocument();
      });
    });
  });

  describe('recordings grid', () => {
    it('displays recordings in a grid', async () => {
      const recordings = [
        createMockRecording({ id: '1', name: 'Recording 1' }),
        createMockRecording({ id: '2', name: 'Recording 2' }),
      ];
      mockGetRecordings.mockResolvedValue(recordings);

      renderWithRouter(<RecordingsListPage />);

      await waitFor(() => {
        expect(screen.getByText('Recording 1')).toBeInTheDocument();
        expect(screen.getByText('Recording 2')).toBeInTheDocument();
      });
    });

    it('shows recording duration on card', async () => {
      const recordings = [
        createMockRecording({ id: '1', name: 'Test', duration: 90000 }), // 1:30
      ];
      mockGetRecordings.mockResolvedValue(recordings);

      renderWithRouter(<RecordingsListPage />);

      await waitFor(() => {
        expect(screen.getByText(/1:30/)).toBeInTheDocument();
      });
    });

    it('shows recording creation date on card', async () => {
      const recordings = [
        createMockRecording({
          id: '1',
          name: 'Test',
          createdAt: '2026-01-15T10:00:00Z',
        }),
      ];
      mockGetRecordings.mockResolvedValue(recordings);

      renderWithRouter(<RecordingsListPage />);

      await waitFor(() => {
        // Check for date in some format
        expect(screen.getByText(/jan.*15/i)).toBeInTheDocument();
      });
    });

    it('shows recording file size on card', async () => {
      const recordings = [
        createMockRecording({
          id: '1',
          name: 'Test',
          fileSize: 1024 * 1024 * 2.5, // 2.5 MB
        }),
      ];
      mockGetRecordings.mockResolvedValue(recordings);

      renderWithRouter(<RecordingsListPage />);

      await waitFor(() => {
        expect(screen.getByText(/2\.5.*mb/i)).toBeInTheDocument();
      });
    });
  });

  describe('navigation', () => {
    it('recording cards are clickable links', async () => {
      const recordings = [
        createMockRecording({ id: 'abc-123', name: 'Clickable Recording' }),
      ];
      mockGetRecordings.mockResolvedValue(recordings);

      renderWithRouter(<RecordingsListPage />);

      await waitFor(() => {
        const link = screen.getByRole('link', { name: /clickable recording/i });
        expect(link).toHaveAttribute('href', '/recordings/abc-123');
      });
    });
  });

  describe('fetching recordings', () => {
    it('calls getRecordings API on mount', async () => {
      mockGetRecordings.mockResolvedValue([]);

      renderWithRouter(<RecordingsListPage />);

      await waitFor(() => {
        expect(mockGetRecordings).toHaveBeenCalled();
      });
    });
  });
});
