import type { Response } from 'express'
import { type ErrorCode } from '@just-recordings/shared'

export function sendSuccess<T>(_res: Response, _data: T, _status = 200): void {
  // stub
}

export function sendError(_res: Response, _errorCode: ErrorCode, _status: number): void {
  // stub
}

export function sendUnauthorized(_res: Response): void {
  // stub
}

export function sendForbidden(_res: Response): void {
  // stub
}

export function sendNotFound(_res: Response, _errorCode: ErrorCode = 'NOT_FOUND'): void {
  // stub
}

export function sendBadRequest(_res: Response, _errorCode: ErrorCode = 'INVALID_INPUT'): void {
  // stub
}

export function sendInternalError(_res: Response): void {
  // stub
}
