export { chunkBlob } from './chunkBlob'
export { CloudinaryUploader, CLOUDINARY_CHUNK_SIZE } from './CloudinaryUploader'
export { DevUploader } from './DevUploader'
export { ProdUploader } from './ProdUploader'
export type { TokenGetter, Uploader, UploadMetadata, UploadResult } from './types'

import { CloudinaryUploader } from './CloudinaryUploader'
import { DevUploader } from './DevUploader'
import type { TokenGetter, Uploader } from './types'

export function createUploader(baseUrl: string, isDev: boolean, getToken?: TokenGetter): Uploader {
  if (isDev) {
    return new DevUploader(baseUrl, getToken)
  }
  return new CloudinaryUploader(baseUrl, getToken)
}
