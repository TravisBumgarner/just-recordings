import { describe, expect, it } from 'vitest'
import {
  COUNTDOWN_CHANNELS,
  createCountdownState,
  isValidCountdownState,
} from '../countdownIpc'

describe('countdownIpc', () => {
  describe('COUNTDOWN_CHANNELS', () => {
    it('has START channel', () => {
      expect(COUNTDOWN_CHANNELS.START).toBe('countdown:start')
    })

    it('has TICK channel', () => {
      expect(COUNTDOWN_CHANNELS.TICK).toBe('countdown:tick')
    })

    it('has END channel', () => {
      expect(COUNTDOWN_CHANNELS.END).toBe('countdown:end')
    })
  })

  describe('isValidCountdownState', () => {
    it('returns true for valid state with required fields', () => {
      const state = { totalSeconds: 3, secondsRemaining: 2 }
      expect(isValidCountdownState(state)).toBe(true)
    })

    it('returns true for state with zero secondsRemaining', () => {
      const state = { totalSeconds: 3, secondsRemaining: 0 }
      expect(isValidCountdownState(state)).toBe(true)
    })

    it('returns false for null', () => {
      expect(isValidCountdownState(null)).toBe(false)
    })

    it('returns false for undefined', () => {
      expect(isValidCountdownState(undefined)).toBe(false)
    })

    it('returns false for non-object', () => {
      expect(isValidCountdownState('string')).toBe(false)
    })

    it('returns false for missing totalSeconds', () => {
      const state = { secondsRemaining: 2 }
      expect(isValidCountdownState(state)).toBe(false)
    })

    it('returns false for missing secondsRemaining', () => {
      const state = { totalSeconds: 3 }
      expect(isValidCountdownState(state)).toBe(false)
    })

    it('returns false for non-number totalSeconds', () => {
      const state = { totalSeconds: '3', secondsRemaining: 2 }
      expect(isValidCountdownState(state)).toBe(false)
    })

    it('returns false for non-number secondsRemaining', () => {
      const state = { totalSeconds: 3, secondsRemaining: '2' }
      expect(isValidCountdownState(state)).toBe(false)
    })
  })

  describe('createCountdownState', () => {
    it('creates state with default totalSeconds of 3', () => {
      const state = createCountdownState()
      expect(state.totalSeconds).toBe(3)
    })

    it('creates state with default secondsRemaining of 3', () => {
      const state = createCountdownState()
      expect(state.secondsRemaining).toBe(3)
    })

    it('allows overriding totalSeconds', () => {
      const state = createCountdownState({ totalSeconds: 5 })
      expect(state.totalSeconds).toBe(5)
    })

    it('allows overriding secondsRemaining', () => {
      const state = createCountdownState({ secondsRemaining: 2 })
      expect(state.secondsRemaining).toBe(2)
    })

    it('allows overriding both fields', () => {
      const state = createCountdownState({ totalSeconds: 10, secondsRemaining: 5 })
      expect(state.totalSeconds).toBe(10)
      expect(state.secondsRemaining).toBe(5)
    })
  })
})
