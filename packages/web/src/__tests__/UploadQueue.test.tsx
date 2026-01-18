import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import UploadQueue from '../pages/UploadQueue';
import type { Recording, UploadManager, QueueChangeCallback } from '@just-recordings/recorder';

// Helper to create a test recording
function createTestRecording(overrides: Partial<Recording> = {}): Recording {
  return {
    id: 1,
    name: 'Test Recording',
    blob: new Blob(['test'], { type: 'video/webm' }),
    mimeType: 'video/webm',
    duration: 60000,
    createdAt: new Date(),
    fileSize: 1024 * 1024,
    uploadStatus: 'pending',
    uploadProgress: 0,
    ...overrides,
  };
}

// Create mock upload manager
function createMockUploadManager(initialQueue: Recording[] = []): {
  manager: UploadManager;
  triggerQueueChange: (queue: Recording[]) => void;
} {
  let callback: QueueChangeCallback | null = null;

  const manager = {
    getQueue: vi.fn().mockResolvedValue(initialQueue),
    onQueueChange: vi.fn().mockImplementation((cb: QueueChangeCallback) => {
      callback = cb;
      // Immediately call with initial queue
      Promise.resolve().then(() => cb(initialQueue));
      return () => {
        callback = null;
      };
    }),
    retry: vi.fn().mockResolvedValue(undefined),
    cancel: vi.fn().mockResolvedValue(undefined),
    enqueue: vi.fn(),
    initialize: vi.fn(),
  } as unknown as UploadManager;

  const triggerQueueChange = (queue: Recording[]) => {
    if (callback) {
      callback(queue);
    }
  };

  return { manager, triggerQueueChange };
}

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
};

describe('UploadQueue', () => {
  describe('empty state', () => {
    it('shows empty state when no recordings in queue', async () => {
      const { manager } = createMockUploadManager([]);

      renderWithRouter(<UploadQueue uploadManager={manager} />);

      await waitFor(() => {
        expect(screen.getByTestId('empty-state')).toBeInTheDocument();
      });
    });

    it('displays helpful message in empty state', async () => {
      const { manager } = createMockUploadManager([]);

      renderWithRouter(<UploadQueue uploadManager={manager} />);

      await waitFor(() => {
        expect(screen.getByText(/no pending uploads/i)).toBeInTheDocument();
      });
    });
  });

  describe('queue list', () => {
    it('shows list of recordings in queue', async () => {
      const recordings = [
        createTestRecording({ id: 1, name: 'Recording 1', uploadStatus: 'pending' }),
        createTestRecording({ id: 2, name: 'Recording 2', uploadStatus: 'uploading' }),
      ];
      const { manager } = createMockUploadManager(recordings);

      renderWithRouter(<UploadQueue uploadManager={manager} />);

      await waitFor(() => {
        expect(screen.getByText('Recording 1')).toBeInTheDocument();
        expect(screen.getByText('Recording 2')).toBeInTheDocument();
      });
    });

    it('shows upload status for each recording', async () => {
      const recordings = [
        createTestRecording({ id: 1, name: 'Recording A', uploadStatus: 'pending' }),
        createTestRecording({ id: 2, name: 'Recording B', uploadStatus: 'uploading' }),
        createTestRecording({ id: 3, name: 'Recording C', uploadStatus: 'failed' }),
      ];
      const { manager } = createMockUploadManager(recordings);

      renderWithRouter(<UploadQueue uploadManager={manager} />);

      await waitFor(() => {
        expect(screen.getByText('Pending')).toBeInTheDocument();
        expect(screen.getByText('Uploading')).toBeInTheDocument();
        expect(screen.getByText('Failed')).toBeInTheDocument();
      });
    });

    it('shows upload progress percentage during upload', async () => {
      const recordings = [
        createTestRecording({
          id: 1,
          name: 'Uploading Recording',
          uploadStatus: 'uploading',
          uploadProgress: 45,
        }),
      ];
      const { manager } = createMockUploadManager(recordings);

      renderWithRouter(<UploadQueue uploadManager={manager} />);

      await waitFor(() => {
        expect(screen.getByText(/45%/)).toBeInTheDocument();
      });
    });

    it('shows error message for failed uploads', async () => {
      const recordings = [
        createTestRecording({
          id: 1,
          name: 'Failed Recording',
          uploadStatus: 'failed',
          uploadError: 'Network error',
        }),
      ];
      const { manager } = createMockUploadManager(recordings);

      renderWithRouter(<UploadQueue uploadManager={manager} />);

      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
      });
    });
  });

  describe('retry functionality', () => {
    it('shows retry button for failed uploads', async () => {
      const recordings = [
        createTestRecording({ id: 1, name: 'Failed Recording', uploadStatus: 'failed' }),
      ];
      const { manager } = createMockUploadManager(recordings);

      renderWithRouter(<UploadQueue uploadManager={manager} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
      });
    });

    it('calls retry when retry button clicked', async () => {
      const recordings = [
        createTestRecording({ id: 42, name: 'Failed Recording', uploadStatus: 'failed' }),
      ];
      const { manager } = createMockUploadManager(recordings);

      renderWithRouter(<UploadQueue uploadManager={manager} />);

      await waitFor(() => {
        const retryButton = screen.getByRole('button', { name: /retry/i });
        fireEvent.click(retryButton);
      });

      expect(manager.retry).toHaveBeenCalledWith(42);
    });

    it('does not show retry button for pending uploads', async () => {
      const recordings = [
        createTestRecording({ id: 1, name: 'Pending Recording', uploadStatus: 'pending' }),
      ];
      const { manager } = createMockUploadManager(recordings);

      renderWithRouter(<UploadQueue uploadManager={manager} />);

      await waitFor(() => {
        expect(screen.getByText('Pending Recording')).toBeInTheDocument();
      });

      expect(screen.queryByRole('button', { name: /retry/i })).not.toBeInTheDocument();
    });
  });

  describe('cancel functionality', () => {
    it('shows cancel button for recordings in queue', async () => {
      const recordings = [
        createTestRecording({ id: 1, name: 'Recording', uploadStatus: 'pending' }),
      ];
      const { manager } = createMockUploadManager(recordings);

      renderWithRouter(<UploadQueue uploadManager={manager} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
      });
    });

    it('calls cancel when cancel button clicked', async () => {
      const recordings = [
        createTestRecording({ id: 99, name: 'Recording to cancel', uploadStatus: 'pending' }),
      ];
      const { manager } = createMockUploadManager(recordings);

      renderWithRouter(<UploadQueue uploadManager={manager} />);

      await waitFor(() => {
        const cancelButton = screen.getByRole('button', { name: /cancel/i });
        fireEvent.click(cancelButton);
      });

      expect(manager.cancel).toHaveBeenCalledWith(99);
    });
  });

  describe('queue subscription', () => {
    it('subscribes to queue changes on mount', async () => {
      const { manager } = createMockUploadManager([]);

      renderWithRouter(<UploadQueue uploadManager={manager} />);

      await waitFor(() => {
        expect(manager.onQueueChange).toHaveBeenCalled();
      });
    });

    it('updates display when queue changes', async () => {
      const initialQueue = [
        createTestRecording({ id: 1, name: 'Initial Recording', uploadStatus: 'pending' }),
      ];
      const { manager, triggerQueueChange } = createMockUploadManager(initialQueue);

      renderWithRouter(<UploadQueue uploadManager={manager} />);

      await waitFor(() => {
        expect(screen.getByText('Initial Recording')).toBeInTheDocument();
      });

      // Simulate queue change
      triggerQueueChange([
        createTestRecording({ id: 2, name: 'New Recording', uploadStatus: 'uploading' }),
      ]);

      await waitFor(() => {
        expect(screen.getByText('New Recording')).toBeInTheDocument();
        expect(screen.queryByText('Initial Recording')).not.toBeInTheDocument();
      });
    });
  });
});
