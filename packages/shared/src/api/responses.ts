// Error codes enum
export const ErrorCode = {
  // Auth errors
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',

  // Resource errors
  NOT_FOUND: 'NOT_FOUND',
  RECORDING_NOT_FOUND: 'RECORDING_NOT_FOUND',
  FILE_NOT_FOUND: 'FILE_NOT_FOUND',
  THUMBNAIL_NOT_FOUND: 'THUMBNAIL_NOT_FOUND',

  // Validation errors
  INVALID_UUID: 'INVALID_UUID',
  INVALID_INPUT: 'INVALID_INPUT',
  INVALID_CHUNK_INDEX: 'INVALID_CHUNK_INDEX',
  MISSING_CHUNKS: 'MISSING_CHUNKS',

  // Server errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  AUTH_SERVICE_ERROR: 'AUTH_SERVICE_ERROR',
} as const

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode]

// Response types
export type ApiSuccess<T> = {
  success: true
  data: T
}

export type ApiFailure = {
  success: false
  errorCode: ErrorCode
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure

// Error messages map with user-friendly messages
export const errorMessages: Record<ErrorCode, string> = {
  // Auth errors
  UNAUTHORIZED: 'Please sign in to continue',
  FORBIDDEN: 'You do not have permission to access this resource',

  // Resource errors
  NOT_FOUND: 'The requested resource was not found',
  RECORDING_NOT_FOUND: 'Recording not found',
  FILE_NOT_FOUND: 'Video file not found',
  THUMBNAIL_NOT_FOUND: 'Thumbnail not found',

  // Validation errors
  INVALID_UUID: 'Invalid identifier format',
  INVALID_INPUT: 'Invalid input provided',
  INVALID_CHUNK_INDEX: 'Invalid chunk index',
  MISSING_CHUNKS: 'Missing or invalid upload chunks',

  // Server errors
  INTERNAL_ERROR: 'An unexpected error occurred. Please try again.',
  AUTH_SERVICE_ERROR: 'Authentication service unavailable',
}
