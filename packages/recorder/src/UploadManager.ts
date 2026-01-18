import { Recording } from './types';
import { RecorderDatabase } from './db';
import { Uploader } from './uploader/types';

export type QueueChangeCallback = (queue: Recording[]) => void;

export class UploadManager {
  private db: RecorderDatabase;
  private uploader: Uploader;
  private listeners: Set<QueueChangeCallback> = new Set();
  private processing: boolean = false;

  constructor(db: RecorderDatabase, uploader: Uploader) {
    this.db = db;
    this.uploader = uploader;
  }

  // Stub: Start processing queue on app load
  async initialize(): Promise<void> {
    return;
  }

  // Stub: Add recording to queue (called after stopRecording)
  async enqueue(recording: Recording): Promise<number> {
    return 0;
  }

  // Stub: Retry a failed upload
  async retry(id: number): Promise<void> {
    return;
  }

  // Stub: Cancel/remove from queue
  async cancel(id: number): Promise<void> {
    return;
  }

  // Stub: Get current queue
  async getQueue(): Promise<Recording[]> {
    return [];
  }

  // Subscribe to queue changes
  onQueueChange(callback: QueueChangeCallback): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  // Stub: Notify listeners of queue changes
  protected async notifyListeners(): Promise<void> {
    return;
  }
}
