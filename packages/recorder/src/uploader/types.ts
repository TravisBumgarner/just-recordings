import type { FinalizeUploadRequest, FinalizeUploadResponse } from '@just-recordings/shared'

export type UploadMetadata = FinalizeUploadRequest
export type UploadResult = FinalizeUploadResponse

export type TokenGetter = () => Promise<string | undefined>

export interface Uploader {
  startUpload(): Promise<string>
  uploadChunk(uploadId: string, chunk: Blob, index: number): Promise<void>
  finalizeUpload(uploadId: string, metadata: UploadMetadata): Promise<UploadResult>
}
