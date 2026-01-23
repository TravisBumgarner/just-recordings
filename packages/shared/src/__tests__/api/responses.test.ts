import { describe, expect, it } from 'vitest'
import { ErrorCode, errorMessages } from '../../api/responses'

describe('errorMessages', () => {
  it('has a message for every ErrorCode', () => {
    const errorCodes = Object.values(ErrorCode)

    for (const code of errorCodes) {
      expect(errorMessages[code]).toBeDefined()
      expect(typeof errorMessages[code]).toBe('string')
      expect(errorMessages[code].length).toBeGreaterThan(0)
    }
  })
})
