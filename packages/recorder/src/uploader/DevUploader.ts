import { Uploader, UploadMetadata, UploadResult } from './types';

export class DevUploader implements Uploader {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async startUpload(): Promise<string> {
    return '';
  }

  async uploadChunk(
    _uploadId: string,
    _chunk: Blob,
    _index: number
  ): Promise<void> {
    // stub
  }

  async finalizeUpload(
    _uploadId: string,
    _metadata: UploadMetadata
  ): Promise<UploadResult> {
    return {
      success: false,
      fileId: '',
      path: '',
      size: 0,
    };
  }
}
