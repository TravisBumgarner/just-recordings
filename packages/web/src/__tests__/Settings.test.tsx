import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { Settings } from '../components/Settings'

describe('Settings', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('rendering', () => {
    it('renders settings header', () => {
      render(<Settings />)

      expect(screen.getByText('Settings')).toBeInTheDocument()
    })

    it('renders auto-upload toggle with label', () => {
      render(<Settings />)

      expect(
        screen.getByRole('checkbox', { name: /auto-upload after recording/i }),
      ).toBeInTheDocument()
    })

    it('renders description text for auto-upload', () => {
      render(<Settings />)

      expect(
        screen.getByText(/when enabled, recordings are automatically uploaded/i),
      ).toBeInTheDocument()
    })
  })

  describe('auto-upload toggle behavior', () => {
    it('is checked by default when localStorage is empty', () => {
      render(<Settings />)

      expect(screen.getByRole('checkbox', { name: /auto-upload/i })).toBeChecked()
    })

    it('is unchecked when localStorage has false', () => {
      localStorage.setItem('just-recordings-auto-upload', 'false')

      render(<Settings />)

      expect(screen.getByRole('checkbox', { name: /auto-upload/i })).not.toBeChecked()
    })

    it('is checked when localStorage has true', () => {
      localStorage.setItem('just-recordings-auto-upload', 'true')

      render(<Settings />)

      expect(screen.getByRole('checkbox', { name: /auto-upload/i })).toBeChecked()
    })

    it('toggles off when clicked while checked', () => {
      render(<Settings />)

      const toggle = screen.getByRole('checkbox', { name: /auto-upload/i })
      expect(toggle).toBeChecked()

      fireEvent.click(toggle)

      expect(toggle).not.toBeChecked()
    })

    it('toggles on when clicked while unchecked', () => {
      localStorage.setItem('just-recordings-auto-upload', 'false')
      render(<Settings />)

      const toggle = screen.getByRole('checkbox', { name: /auto-upload/i })
      expect(toggle).not.toBeChecked()

      fireEvent.click(toggle)

      expect(toggle).toBeChecked()
    })

    it('persists setting to localStorage when toggled', () => {
      render(<Settings />)

      const toggle = screen.getByRole('checkbox', { name: /auto-upload/i })

      fireEvent.click(toggle)
      expect(localStorage.getItem('just-recordings-auto-upload')).toBe('false')

      fireEvent.click(toggle)
      expect(localStorage.getItem('just-recordings-auto-upload')).toBe('true')
    })
  })

  describe('onClose callback', () => {
    it('renders back button when onClose is provided', () => {
      const onClose = vi.fn()
      render(<Settings onClose={onClose} />)

      expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument()
    })

    it('does not render back button when onClose is not provided', () => {
      render(<Settings />)

      expect(screen.queryByRole('button', { name: /back/i })).not.toBeInTheDocument()
    })

    it('calls onClose when back button is clicked', () => {
      const onClose = vi.fn()
      render(<Settings onClose={onClose} />)

      fireEvent.click(screen.getByRole('button', { name: /back/i }))

      expect(onClose).toHaveBeenCalled()
    })
  })
})
