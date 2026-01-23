export { chunkBlob } from './chunkBlob'
export { CloudinaryUploader, CLOUDINARY_CHUNK_SIZE } from './CloudinaryUploader'
export { ProdUploader } from './ProdUploader'
export type { TokenGetter, Uploader, UploadMetadata, UploadResult } from './types'

import { CloudinaryUploader } from './CloudinaryUploader'
import type { TokenGetter, Uploader } from './types'

export function createUploader(baseUrl: string, getToken?: TokenGetter): Uploader {
  return new CloudinaryUploader(baseUrl, getToken)
}
