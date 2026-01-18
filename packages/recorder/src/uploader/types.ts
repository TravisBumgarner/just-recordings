export interface UploadMetadata {
  filename: string;
  mimeType: string;
  totalChunks: number;
}

export interface UploadResult {
  success: boolean;
  fileId: string;
  path: string;
  size: number;
}

export interface Uploader {
  startUpload(): Promise<string>;
  uploadChunk(uploadId: string, chunk: Blob, index: number): Promise<void>;
  finalizeUpload(
    uploadId: string,
    metadata: UploadMetadata
  ): Promise<UploadResult>;
}
