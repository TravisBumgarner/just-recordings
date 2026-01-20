export { chunkBlob } from './chunkBlob'
export { DevUploader } from './DevUploader'
export { ProdUploader } from './ProdUploader'
export type { Uploader, UploadMetadata, UploadResult } from './types'

import { DevUploader } from './DevUploader'
import { ProdUploader } from './ProdUploader'
import type { Uploader } from './types'

export function createUploader(baseUrl: string, isDev: boolean): Uploader {
  if (isDev) {
    return new DevUploader(baseUrl)
  }
  return new ProdUploader()
}
