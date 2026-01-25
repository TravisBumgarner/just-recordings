import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { PermissionDeniedMessage } from '../components/PermissionDeniedMessage'

describe('PermissionDeniedMessage', () => {
  const originalUserAgent = navigator.userAgent

  afterEach(() => {
    Object.defineProperty(navigator, 'userAgent', {
      value: originalUserAgent,
      writable: true,
    })
  })

  describe('permission types', () => {
    it('shows message for microphone permission denied', () => {
      render(<PermissionDeniedMessage permission="microphone" />)

      expect(screen.getByTestId('permission-denied-message')).toHaveTextContent(/microphone/i)
    })

    it('shows message for camera permission denied', () => {
      render(<PermissionDeniedMessage permission="camera" />)

      expect(screen.getByTestId('permission-denied-message')).toHaveTextContent(/camera/i)
    })

    it('shows message for screen recording blocked', () => {
      render(<PermissionDeniedMessage permission="screen" />)

      expect(screen.getByTestId('permission-denied-message')).toHaveTextContent(/screen/i)
    })
  })

  describe('browser-specific instructions', () => {
    it('shows Chrome instructions for Chrome browser', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        writable: true,
      })

      render(<PermissionDeniedMessage permission="microphone" />)

      expect(screen.getByTestId('permission-denied-message')).toHaveTextContent(/lock icon/i)
    })

    it('shows Firefox instructions for Firefox browser', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
        writable: true,
      })

      render(<PermissionDeniedMessage permission="microphone" />)

      expect(screen.getByTestId('permission-denied-message')).toHaveTextContent(/shield icon/i)
    })

    it('shows Safari instructions for Safari browser', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
        writable: true,
      })

      render(<PermissionDeniedMessage permission="microphone" />)

      expect(screen.getByTestId('permission-denied-message')).toHaveTextContent(/Safari menu/i)
    })

    it('shows Edge instructions for Edge browser', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
        writable: true,
      })

      render(<PermissionDeniedMessage permission="microphone" />)

      expect(screen.getByTestId('permission-denied-message')).toHaveTextContent(/lock icon/i)
    })

    it('shows fallback message for unknown browsers', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'UnknownBrowser/1.0',
        writable: true,
      })

      render(<PermissionDeniedMessage permission="microphone" />)

      expect(screen.getByTestId('permission-denied-message')).toHaveTextContent(/browser settings/i)
    })
  })

  describe('dismiss button', () => {
    it('does not show dismiss button when onDismiss is not provided', () => {
      render(<PermissionDeniedMessage permission="microphone" />)

      expect(screen.queryByRole('button', { name: /dismiss/i })).not.toBeInTheDocument()
    })

    it('shows dismiss button when onDismiss is provided', () => {
      const onDismiss = vi.fn()

      render(<PermissionDeniedMessage permission="microphone" onDismiss={onDismiss} />)

      expect(screen.getByRole('button', { name: /dismiss/i })).toBeInTheDocument()
    })

    it('calls onDismiss when dismiss button is clicked', () => {
      const onDismiss = vi.fn()

      render(<PermissionDeniedMessage permission="microphone" onDismiss={onDismiss} />)

      fireEvent.click(screen.getByRole('button', { name: /dismiss/i }))

      expect(onDismiss).toHaveBeenCalledTimes(1)
    })
  })
})
