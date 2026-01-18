export interface Recording {
  id?: number;
  name: string;
  blob: Blob;
  mimeType: string;
  duration: number;
  createdAt: Date;
  fileSize: number;
}

export type RecorderState = 'idle' | 'recording' | 'paused';

export interface RecordingOptions {
  mimeType?: string;
  videoBitsPerSecond?: number;
  audioBitsPerSecond?: number;
}
