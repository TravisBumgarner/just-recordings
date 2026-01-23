import { describe, expect, it } from 'vitest'
import { isValidUUID, isValidChunkIndex } from '../routes/shared/validation.js'

describe('isValidUUID', () => {
  it('returns true for valid UUID v4', () => {
    expect(isValidUUID('550e8400-e29b-41d4-a716-446655440000')).toBe(true)
  })

  it('returns true for valid UUID v4 with uppercase letters', () => {
    expect(isValidUUID('550E8400-E29B-41D4-A716-446655440000')).toBe(true)
  })

  it('returns false for UUID v1 format', () => {
    // UUID v1 has version 1 in position 13 (not 4)
    expect(isValidUUID('550e8400-e29b-11d4-a716-446655440000')).toBe(false)
  })

  it('returns false for invalid UUID format', () => {
    expect(isValidUUID('not-a-uuid')).toBe(false)
  })

  it('returns false for empty string', () => {
    expect(isValidUUID('')).toBe(false)
  })

  it('returns false for UUID with invalid variant', () => {
    // Variant must be 8, 9, a, or b in position 19
    expect(isValidUUID('550e8400-e29b-41d4-0716-446655440000')).toBe(false)
  })
})

describe('isValidChunkIndex', () => {
  it('returns true for zero', () => {
    expect(isValidChunkIndex('0')).toBe(true)
  })

  it('returns true for positive integer', () => {
    expect(isValidChunkIndex('5')).toBe(true)
  })

  it('returns true for larger positive integer', () => {
    expect(isValidChunkIndex('100')).toBe(true)
  })

  it('returns false for negative number', () => {
    expect(isValidChunkIndex('-1')).toBe(false)
  })

  it('returns false for decimal number', () => {
    expect(isValidChunkIndex('1.5')).toBe(false)
  })

  it('returns false for non-numeric string', () => {
    expect(isValidChunkIndex('abc')).toBe(false)
  })

  it('returns false for empty string', () => {
    expect(isValidChunkIndex('')).toBe(false)
  })

  it('returns false for path traversal attempt', () => {
    expect(isValidChunkIndex('../1')).toBe(false)
  })
})
