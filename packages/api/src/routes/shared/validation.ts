// UUID v4 format validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export function isValidUUID(id: string): boolean {
  return UUID_REGEX.test(id)
}

// Validate chunk index is a non-negative integer (prevents path traversal)
export function isValidChunkIndex(index: string): boolean {
  const num = parseInt(index, 10)
  return /^\d+$/.test(index) && Number.isInteger(num) && num >= 0
}
