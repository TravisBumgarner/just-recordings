export interface HealthResponse {
  status: 'ok' | 'error';
}

export interface RecordingMetadata {
  id: string;
  name: string;
  mimeType: string;
  duration: number;
  fileSize: number;
  createdAt: string;
  path: string;
}

export interface RecordingsListResponse {
  recordings: RecordingMetadata[];
}

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
