export type { Uploader, UploadMetadata, UploadResult } from './types'
export { DevUploader } from './DevUploader'
export { ProdUploader } from './ProdUploader'
export { chunkBlob } from './chunkBlob'

import type { Uploader } from './types'
import { DevUploader } from './DevUploader'
import { ProdUploader } from './ProdUploader'

export function createUploader(baseUrl: string, isDev: boolean): Uploader {
  if (isDev) {
    return new DevUploader(baseUrl)
  }
  return new ProdUploader()
}
