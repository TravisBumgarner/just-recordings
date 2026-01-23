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
  filePath: string,
  options?: UploadOptions,
): Promise<UploadResult> {
  const cloudinary = getCloudinary()

  const result = await cloudinary.uploader.upload(filePath, {
    resource_type: 'video',
    tags: getStandardTags(),
    folder: options?.folder,
  })

  return {
    url: result.secure_url,
    publicId: result.public_id,
  }
}

/**
 * Upload an image file to Cloudinary.
 */
export async function uploadImage(
  filePath: string,
  options?: UploadOptions,
): Promise<UploadResult> {
  const cloudinary = getCloudinary()

  const result = await cloudinary.uploader.upload(filePath, {
    resource_type: 'image',
    tags: getStandardTags(),
    folder: options?.folder,
  })

  return {
    url: result.secure_url,
    publicId: result.public_id,
  }
}

/**
 * Delete a file from Cloudinary by its public ID.
 */
export async function deleteByPublicId(publicId: string): Promise<void> {
  const cloudinary = getCloudinary()
  await cloudinary.uploader.destroy(publicId, {})
}

/**
 * Delete all files with a specific tag (for mass cleanup).
 */
export async function deleteByTag(tag: string): Promise<void> {
  const cloudinary = getCloudinary()
  await cloudinary.api.delete_resources_by_tag(tag, {})
}
