import { act, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { formatTime, RecordingTimer } from '../components/RecordingTimer'

describe('formatTime', () => {
  it('formats 0 milliseconds as 00:00', () => {
    expect(formatTime(0)).toBe('00:00')
  })

  it('formats seconds correctly', () => {
    expect(formatTime(5000)).toBe('00:05')
    expect(formatTime(45000)).toBe('00:45')
  })

  it('formats minutes correctly', () => {
    expect(formatTime(60000)).toBe('01:00')
    expect(formatTime(125000)).toBe('02:05')
    expect(formatTime(599000)).toBe('09:59')
  })

  it('formats time over an hour with HH:MM:SS', () => {
    expect(formatTime(3600000)).toBe('01:00:00')
    expect(formatTime(3661000)).toBe('01:01:01')
    expect(formatTime(7325000)).toBe('02:02:05')
  })
})

describe('RecordingTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('display', () => {
    it('displays time in MM:SS format', () => {
      const getElapsedTime = vi.fn(() => 65000) // 1:05

      render(<RecordingTimer getElapsedTime={getElapsedTime} />)

      expect(screen.getByTestId('recording-timer')).toHaveTextContent('01:05')
    })

    it('displays time over 1 hour in HH:MM:SS format', () => {
      const getElapsedTime = vi.fn(() => 3665000) // 1:01:05

      render(<RecordingTimer getElapsedTime={getElapsedTime} />)

      expect(screen.getByTestId('recording-timer')).toHaveTextContent('01:01:05')
    })
  })

  describe('real-time updates', () => {
    it('updates display at regular intervals', () => {
      let elapsed = 0
      const getElapsedTime = vi.fn(() => elapsed)

      render(<RecordingTimer getElapsedTime={getElapsedTime} updateInterval={100} />)

      expect(screen.getByTestId('recording-timer')).toHaveTextContent('00:00')

      // Advance time and update elapsed
      elapsed = 1000
      act(() => {
        vi.advanceTimersByTime(100)
      })

      expect(screen.getByTestId('recording-timer')).toHaveTextContent('00:01')

      // Advance more
      elapsed = 5000
      act(() => {
        vi.advanceTimersByTime(100)
      })

      expect(screen.getByTestId('recording-timer')).toHaveTextContent('00:05')
    })
  })

  describe('cleanup', () => {
    it('cleans up interval on unmount', () => {
      const getElapsedTime = vi.fn(() => 0)
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval')

      const { unmount } = render(<RecordingTimer getElapsedTime={getElapsedTime} />)

      unmount()

      expect(clearIntervalSpy).toHaveBeenCalled()
      clearIntervalSpy.mockRestore()
    })
  })
})
