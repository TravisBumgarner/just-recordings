import { describe, expect, it } from 'vitest'
import {
  emailSchema,
  getValidationError,
  MINIMUM_PASSWORD_LENGTH,
  signupSchema,
  validateEmail,
  validatePassword,
  validateSignup,
} from '../../../../web/src/auth/validation'

describe('MINIMUM_PASSWORD_LENGTH', () => {
  it('should be 10', () => {
    expect(MINIMUM_PASSWORD_LENGTH).toBe(10)
  })
})

describe('validateEmail', () => {
  it('returns success for valid email', () => {
    const result = validateEmail('test@example.com')
    expect(result.success).toBe(true)
  })

  it('returns failure for invalid email format', () => {
    const result = validateEmail('not-an-email')
    expect(result.success).toBe(false)
  })

  it('returns failure for empty string', () => {
    const result = validateEmail('')
    expect(result.success).toBe(false)
  })
})

describe('validatePassword', () => {
  const validPassword = 'password123'

  it('returns success when passwords match and meet minimum length', () => {
    const result = validatePassword(validPassword, validPassword)
    expect(result.success).toBe(true)
  })

  it('returns failure when passwords do not match', () => {
    const result = validatePassword(validPassword, 'different123')
    expect(result.success).toBe(false)
  })

  it('returns failure when password is too short', () => {
    const shortPassword = 'short'
    const result = validatePassword(shortPassword, shortPassword)
    expect(result.success).toBe(false)
  })
})

describe('validateSignup', () => {
  const validEmail = 'test@example.com'
  const validPassword = 'password123'

  it('returns success for valid signup data', () => {
    const result = validateSignup(validEmail, validPassword, validPassword)
    expect(result.success).toBe(true)
  })

  it('returns failure for invalid email', () => {
    const result = validateSignup('invalid', validPassword, validPassword)
    expect(result.success).toBe(false)
  })

  it('returns failure when passwords do not match', () => {
    const result = validateSignup(validEmail, validPassword, 'different123')
    expect(result.success).toBe(false)
  })

  it('returns failure when password is too short', () => {
    const result = validateSignup(validEmail, 'short', 'short')
    expect(result.success).toBe(false)
  })
})

describe('getValidationError', () => {
  it('extracts error message from failed validation', () => {
    const result = validateEmail('invalid')
    if (!result.success) {
      const errorMessage = getValidationError(result)
      expect(typeof errorMessage).toBe('string')
      expect(errorMessage.length).toBeGreaterThan(0)
    }
  })

  it('returns fallback message when no issues present', () => {
    const fakeResult = {
      success: false as const,
      error: { issues: [] },
    }
    // @ts-expect-error - intentionally passing incomplete ZodError for test
    const errorMessage = getValidationError(fakeResult)
    expect(errorMessage).toBe('Validation failed')
  })
})

describe('emailSchema', () => {
  it('parses valid email object', () => {
    const result = emailSchema.safeParse({ email: 'test@example.com' })
    expect(result.success).toBe(true)
  })

  it('rejects object with invalid email', () => {
    const result = emailSchema.safeParse({ email: 'not-valid' })
    expect(result.success).toBe(false)
  })
})

describe('signupSchema', () => {
  it('parses valid signup object', () => {
    const result = signupSchema.safeParse({
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    })
    expect(result.success).toBe(true)
  })

  it('rejects when passwords do not match', () => {
    const result = signupSchema.safeParse({
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'different123',
    })
    expect(result.success).toBe(false)
  })
})
