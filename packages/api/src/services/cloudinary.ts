import config, { getCloudinary } from '../config.js'

export interface UploadResult {
  url: string
  publicId: string
}

export interface UploadOptions {
  folder?: string
}

/**
 * Get the environment tag based on NODE_ENV.
 */
export function getEnvironmentTag(): string {
  return `env:${config.nodeEnv}`
}

/**
 * Get the standard tags applied to all uploads.
 */
export function getStandardTags(): string[] {
  return [getEnvironmentTag(), 'app:just-recordings']
}

/**
 * Upload a video file to Cloudinary.
 */
export async function uploadVideo(
  _filePath: string,
  _options?: UploadOptions,
): Promise<UploadResult> {
  // Stub: will be implemented
  return { url: '', publicId: '' }
}

/**
 * Upload an image file to Cloudinary.
 */
export async function uploadImage(
  _filePath: string,
  _options?: UploadOptions,
): Promise<UploadResult> {
  // Stub: will be implemented
  return { url: '', publicId: '' }
}

/**
 * Delete a file from Cloudinary by its public ID.
 */
export async function deleteByPublicId(_publicId: string): Promise<void> {
  // Stub: will be implemented
}

/**
 * Delete all files with a specific tag (for mass cleanup).
 */
export async function deleteByTag(_tag: string): Promise<void> {
  // Stub: will be implemented
}
