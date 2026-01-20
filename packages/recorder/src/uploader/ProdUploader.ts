import { Uploader, UploadMetadata, UploadResult } from './types'

export class ProdUploader implements Uploader {
  async startUpload(): Promise<string> {
    throw new Error('Not implemented')
  }

  async uploadChunk(_uploadId: string, _chunk: Blob, _index: number): Promise<void> {
    throw new Error('Not implemented')
  }

  async finalizeUpload(_uploadId: string, _metadata: UploadMetadata): Promise<UploadResult> {
    throw new Error('Not implemented')
  }
}
