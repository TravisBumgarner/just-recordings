import { act, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CountdownOverlay } from '../components/CountdownOverlay'

describe('CountdownOverlay', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('initial display', () => {
    it('displays the starting countdown value', () => {
      const onComplete = vi.fn()

      render(<CountdownOverlay seconds={3} onComplete={onComplete} />)

      expect(screen.getByText('3')).toBeInTheDocument()
    })

    it('renders as an overlay', () => {
      const onComplete = vi.fn()

      render(<CountdownOverlay seconds={3} onComplete={onComplete} />)

      expect(screen.getByTestId('countdown-overlay')).toBeInTheDocument()
    })
  })

  describe('countdown behavior', () => {
    it('decrements the number after 1 second', () => {
      const onComplete = vi.fn()

      render(<CountdownOverlay seconds={3} onComplete={onComplete} />)

      expect(screen.getByText('3')).toBeInTheDocument()

      act(() => {
        vi.advanceTimersByTime(1000)
      })

      expect(screen.getByText('2')).toBeInTheDocument()
    })

    it('continues countdown through each second', () => {
      const onComplete = vi.fn()

      render(<CountdownOverlay seconds={3} onComplete={onComplete} />)

      act(() => {
        vi.advanceTimersByTime(1000)
      })
      expect(screen.getByText('2')).toBeInTheDocument()

      act(() => {
        vi.advanceTimersByTime(1000)
      })
      expect(screen.getByText('1')).toBeInTheDocument()
    })
  })

  describe('onComplete callback', () => {
    it('calls onComplete after countdown finishes', () => {
      const onComplete = vi.fn()

      render(<CountdownOverlay seconds={3} onComplete={onComplete} />)

      // Advance through the full countdown
      act(() => {
        vi.advanceTimersByTime(3000)
      })

      expect(onComplete).toHaveBeenCalledTimes(1)
    })

    it('does not call onComplete before countdown finishes', () => {
      const onComplete = vi.fn()

      render(<CountdownOverlay seconds={3} onComplete={onComplete} />)

      act(() => {
        vi.advanceTimersByTime(2000)
      })

      expect(onComplete).not.toHaveBeenCalled()
    })
  })

  describe('cleanup', () => {
    it('cleans up interval on unmount', () => {
      const onComplete = vi.fn()
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval')

      const { unmount } = render(<CountdownOverlay seconds={3} onComplete={onComplete} />)

      unmount()

      expect(clearIntervalSpy).toHaveBeenCalled()
      clearIntervalSpy.mockRestore()
    })
  })
})
