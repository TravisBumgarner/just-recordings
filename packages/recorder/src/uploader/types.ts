import type {
  FinalizeUploadRequest,
  FinalizeUploadResponse,
} from '@just-recordings/shared';

export type UploadMetadata = FinalizeUploadRequest;
export type UploadResult = FinalizeUploadResponse;

export interface Uploader {
  startUpload(): Promise<string>;
  uploadChunk(uploadId: string, chunk: Blob, index: number): Promise<void>;
  finalizeUpload(
    uploadId: string,
    metadata: UploadMetadata
  ): Promise<UploadResult>;
}
