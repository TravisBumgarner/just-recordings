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

// Error messages map - stub with empty object, will be implemented
export const errorMessages: Record<ErrorCode, string> = {} as Record<ErrorCode, string>
