import { Recording, RecorderState, RecordingOptions } from './types';

// Stub: RecorderService for TDD red phase
export class RecorderService {
  private state: RecorderState = 'idle';
  private listeners: Set<(state: RecorderState) => void> = new Set();

  getState(): RecorderState {
    return this.state;
  }

  onStateChange(callback: (state: RecorderState) => void): () => void {
    // Stub: returns empty unsubscribe function
    return () => {};
  }

  async startScreenRecording(_options?: RecordingOptions): Promise<void> {
    // Stub: does nothing
  }

  async stopRecording(): Promise<Recording> {
    // Stub: returns empty recording
    return {
      name: '',
      blob: new Blob(),
      mimeType: '',
      duration: 0,
      createdAt: new Date(),
      fileSize: 0,
    };
  }

  pauseRecording(): void {
    // Stub: does nothing
  }

  resumeRecording(): void {
    // Stub: does nothing
  }
}
