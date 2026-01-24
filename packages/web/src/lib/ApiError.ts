import { type ErrorCode, errorMessages } from '@just-recordings/shared'

export class ApiError extends Error {
  public readonly errorCode: ErrorCode

  constructor(errorCode: ErrorCode) {
    super(errorMessages[errorCode])
    this.name = 'ApiError'
    this.errorCode = errorCode
  }
}
