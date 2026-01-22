export { chunkBlob } from './chunkBlob'
export { DevUploader } from './DevUploader'
export { ProdUploader } from './ProdUploader'
export type { TokenGetter, Uploader, UploadMetadata, UploadResult } from './types'

import { DevUploader } from './DevUploader'
import { ProdUploader } from './ProdUploader'
import type { TokenGetter, Uploader } from './types'

export function createUploader(baseUrl: string, isDev: boolean, getToken?: TokenGetter): Uploader {
  if (isDev) {
    return new DevUploader(baseUrl, getToken)
  }
  return new ProdUploader()
}
