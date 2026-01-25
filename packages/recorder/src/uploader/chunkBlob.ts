const DEFAULT_CHUNK_SIZE = 6 * 1024 * 1024 // 6MB - Cloudinary requires chunks >= 5MB

export function chunkBlob(blob: Blob, chunkSize: number = DEFAULT_CHUNK_SIZE): Blob[] {
  if (blob.size === 0) {
    return []
  }

  const chunks: Blob[] = []
  let offset = 0

  while (offset < blob.size) {
    const end = Math.min(offset + chunkSize, blob.size)
    chunks.push(blob.slice(offset, end))
    offset = end
  }

  return chunks
}
