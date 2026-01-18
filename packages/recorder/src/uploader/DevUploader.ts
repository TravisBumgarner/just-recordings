import { Uploader, UploadMetadata, UploadResult } from './types';

export class DevUploader implements Uploader {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async startUpload(): Promise<string> {
    const response = await fetch(`${this.baseUrl}/dev/upload/start`, {
      method: 'POST',
    });
    const data = await response.json();
    return data.uploadId;
  }

  async uploadChunk(
    uploadId: string,
    chunk: Blob,
    index: number
  ): Promise<void> {
    const formData = new FormData();
    formData.append('index', String(index));
    formData.append('chunk', chunk);

    await fetch(`${this.baseUrl}/dev/upload/${uploadId}/chunk`, {
      method: 'POST',
      body: formData,
    });
  }

  async finalizeUpload(
    uploadId: string,
    metadata: UploadMetadata
  ): Promise<UploadResult> {
    const response = await fetch(
      `${this.baseUrl}/dev/upload/${uploadId}/finalize`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metadata),
      }
    );
    return await response.json();
  }
}
