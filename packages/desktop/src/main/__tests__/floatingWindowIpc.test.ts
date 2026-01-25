import { describe, expect, it } from 'vitest'
import {
  createRecordingState,
  FLOATING_WINDOW_CHANNELS,
  isValidControlAction,
} from '../floatingWindowIpc'

describe('floatingWindowIpc', () => {
  describe('FLOATING_WINDOW_CHANNELS', () => {
    it('has SHOW channel', () => {
      expect(FLOATING_WINDOW_CHANNELS.SHOW).toBe('show-floating-controls')
    })

    it('has HIDE channel', () => {
      expect(FLOATING_WINDOW_CHANNELS.HIDE).toBe('hide-floating-controls')
    })

    it('has UPDATE_RECORDING_STATE channel', () => {
      expect(FLOATING_WINDOW_CHANNELS.UPDATE_RECORDING_STATE).toBe('update-recording-state')
    })

    it('has CONTROL_ACTION channel', () => {
      expect(FLOATING_WINDOW_CHANNELS.CONTROL_ACTION).toBe('floating-control-action')
    })
  })

  describe('isValidControlAction', () => {
    it('returns true for stop action', () => {
      expect(isValidControlAction('stop')).toBe(true)
    })

    it('returns true for pause action', () => {
      expect(isValidControlAction('pause')).toBe(true)
    })

    it('returns true for resume action', () => {
      expect(isValidControlAction('resume')).toBe(true)
    })

    it('returns true for cancel action', () => {
      expect(isValidControlAction('cancel')).toBe(true)
    })

    it('returns false for invalid string', () => {
      expect(isValidControlAction('invalid')).toBe(false)
    })

    it('returns false for number', () => {
      expect(isValidControlAction(123)).toBe(false)
    })

    it('returns false for null', () => {
      expect(isValidControlAction(null)).toBe(false)
    })
  })

  describe('createRecordingState', () => {
    it('creates state with default status of recording', () => {
      const state = createRecordingState()

      expect(state.status).toBe('recording')
    })

    it('creates state with default elapsedTimeMs of 0', () => {
      const state = createRecordingState()

      expect(state.elapsedTimeMs).toBe(0)
    })

    it('creates state with default webcamEnabled of false', () => {
      const state = createRecordingState()

      expect(state.webcamEnabled).toBe(false)
    })

    it('allows overriding status', () => {
      const state = createRecordingState({ status: 'paused' })

      expect(state.status).toBe('paused')
    })

    it('allows overriding elapsedTimeMs', () => {
      const state = createRecordingState({ elapsedTimeMs: 5000 })

      expect(state.elapsedTimeMs).toBe(5000)
    })

    it('allows overriding webcamEnabled', () => {
      const state = createRecordingState({ webcamEnabled: true })

      expect(state.webcamEnabled).toBe(true)
    })
  })
})
