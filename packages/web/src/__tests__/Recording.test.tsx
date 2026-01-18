import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import RecordingPage from '../pages/Recording';
import type { RecorderService, RecorderState, Recording, UploadManager } from '@just-recordings/recorder';

// Mock RecorderService
function createMockRecorderService(initialState: RecorderState = 'idle'): {
  service: RecorderService;
  stateCallback: (state: RecorderState) => void;
} {
  let stateCallback: (state: RecorderState) => void = () => {};

  const service = {
    getState: vi.fn(() => initialState),
    onStateChange: vi.fn((callback: (state: RecorderState) => void) => {
      stateCallback = callback;
      return vi.fn();
    }),
    startScreenRecording: vi.fn(() => Promise.resolve()),
    stopRecording: vi.fn(() => Promise.resolve({
      id: 1,
      name: 'Test Recording',
      blob: new Blob(['test'], { type: 'video/webm' }),
      mimeType: 'video/webm',
      duration: 1000,
      createdAt: new Date(),
      fileSize: 100,
      uploadStatus: 'pending',
    } as Recording)),
    pauseRecording: vi.fn(),
    resumeRecording: vi.fn(),
    saveRecording: vi.fn(),
    getRecording: vi.fn(),
    getAllRecordings: vi.fn(),
    deleteRecording: vi.fn(),
  } as unknown as RecorderService;

  return { service, stateCallback: (state) => stateCallback(state) };
}

// Mock UploadManager
function createMockUploadManager(): UploadManager {
  return {
    initialize: vi.fn(() => Promise.resolve()),
    enqueue: vi.fn(() => Promise.resolve(1)),
    retry: vi.fn(() => Promise.resolve()),
    cancel: vi.fn(() => Promise.resolve()),
    getQueue: vi.fn(() => Promise.resolve([])),
    onQueueChange: vi.fn(() => () => {}),
  } as unknown as UploadManager;
}

describe('RecordingPage', () => {
  let mockRecorder: { service: RecorderService; stateCallback: (state: RecorderState) => void };
  let mockUploadManager: UploadManager;

  beforeEach(() => {
    mockRecorder = createMockRecorderService();
    mockUploadManager = createMockUploadManager();
  });

  describe('rendering', () => {
    it('renders start recording button when idle', () => {
      render(
        <RecordingPage
          recorderService={mockRecorder.service}
          uploadManager={mockUploadManager}
        />
      );

      expect(screen.getByRole('button', { name: /start recording/i })).toBeInTheDocument();
    });

    it('renders stop recording button when recording', () => {
      mockRecorder = createMockRecorderService('recording');

      render(
        <RecordingPage
          recorderService={mockRecorder.service}
          uploadManager={mockUploadManager}
        />
      );

      // Trigger state change to 'recording'
      act(() => {
        mockRecorder.stateCallback('recording');
      });

      expect(screen.getByRole('button', { name: /stop recording/i })).toBeInTheDocument();
    });

    it('shows stop button when state changes to recording', async () => {
      render(
        <RecordingPage
          recorderService={mockRecorder.service}
          uploadManager={mockUploadManager}
        />
      );

      expect(screen.getByRole('button', { name: /start recording/i })).toBeInTheDocument();

      // Simulate state change to recording
      act(() => {
        mockRecorder.stateCallback('recording');
      });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /stop recording/i })).toBeInTheDocument();
      });
    });
  });

  describe('recording controls', () => {
    it('calls startScreenRecording when start button clicked', async () => {
      render(
        <RecordingPage
          recorderService={mockRecorder.service}
          uploadManager={mockUploadManager}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /start recording/i }));

      expect(mockRecorder.service.startScreenRecording).toHaveBeenCalled();
    });

    it('calls stopRecording when stop button clicked', async () => {
      render(
        <RecordingPage
          recorderService={mockRecorder.service}
          uploadManager={mockUploadManager}
        />
      );

      // Change to recording state
      act(() => {
        mockRecorder.stateCallback('recording');
      });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /stop recording/i })).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /stop recording/i }));

      expect(mockRecorder.service.stopRecording).toHaveBeenCalled();
    });
  });

  describe('IndexedDB queue integration', () => {
    it('enqueues recording to UploadManager after stopping', async () => {
      render(
        <RecordingPage
          recorderService={mockRecorder.service}
          uploadManager={mockUploadManager}
        />
      );

      // Change to recording state
      act(() => {
        mockRecorder.stateCallback('recording');
      });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /stop recording/i })).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /stop recording/i }));

      await waitFor(() => {
        expect(mockUploadManager.enqueue).toHaveBeenCalled();
      });
    });

    it('shows immediate feedback after enqueuing (not after upload)', async () => {
      render(
        <RecordingPage
          recorderService={mockRecorder.service}
          uploadManager={mockUploadManager}
        />
      );

      // Change to recording state
      act(() => {
        mockRecorder.stateCallback('recording');
      });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /stop recording/i })).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /stop recording/i }));

      // Should show success feedback immediately after enqueue
      await waitFor(() => {
        expect(screen.getByTestId('success-feedback')).toBeInTheDocument();
      });

      // Feedback should mention saving/uploading in background
      expect(screen.getByTestId('success-feedback')).toHaveTextContent(/saved|uploading/i);
    });

    it('shows error feedback when enqueue fails', async () => {
      const failingManager = {
        ...createMockUploadManager(),
        enqueue: vi.fn(() => Promise.reject(new Error('Failed to save'))),
      } as unknown as UploadManager;

      render(
        <RecordingPage
          recorderService={mockRecorder.service}
          uploadManager={failingManager}
        />
      );

      // Change to recording state
      act(() => {
        mockRecorder.stateCallback('recording');
      });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /stop recording/i })).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /stop recording/i }));

      // Should show error feedback
      await waitFor(() => {
        expect(screen.getByTestId('error-feedback')).toBeInTheDocument();
      });
    });
  });

  describe('feedback', () => {
    it('clears previous error when starting new recording', async () => {
      const failingManager = {
        ...createMockUploadManager(),
        enqueue: vi.fn(() => Promise.reject(new Error('Failed to save'))),
      } as unknown as UploadManager;

      render(
        <RecordingPage
          recorderService={mockRecorder.service}
          uploadManager={failingManager}
        />
      );

      // First recording fails
      act(() => {
        mockRecorder.stateCallback('recording');
      });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /stop recording/i })).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /stop recording/i }));

      await waitFor(() => {
        expect(screen.getByTestId('error-feedback')).toBeInTheDocument();
      });

      // Go back to idle
      act(() => {
        mockRecorder.stateCallback('idle');
      });

      // Start new recording - error should be cleared
      fireEvent.click(screen.getByRole('button', { name: /start recording/i }));

      await waitFor(() => {
        expect(screen.queryByTestId('error-feedback')).not.toBeInTheDocument();
      });
    });
  });
});
