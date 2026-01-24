import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { PermissionToast } from '../components/PermissionToast'

describe('PermissionToast', () => {
  describe('message display', () => {
    it('renders with the provided message', () => {
      const onDismiss = vi.fn()

      render(<PermissionToast message="Permission denied" onDismiss={onDismiss} />)

      expect(screen.getByText('Permission denied')).toBeInTheDocument()
    })
  })

  describe('dismiss button', () => {
    it('renders a dismiss button', () => {
      const onDismiss = vi.fn()

      render(<PermissionToast message="Test message" onDismiss={onDismiss} />)

      expect(screen.getByRole('button', { name: /close|dismiss/i })).toBeInTheDocument()
    })

    it('calls onDismiss when dismiss button is clicked', () => {
      const onDismiss = vi.fn()

      render(<PermissionToast message="Test message" onDismiss={onDismiss} />)

      fireEvent.click(screen.getByRole('button', { name: /close|dismiss/i }))

      expect(onDismiss).toHaveBeenCalledTimes(1)
    })
  })

  describe('action button', () => {
    it('does not render action button when actionLabel is not provided', () => {
      const onDismiss = vi.fn()

      render(<PermissionToast message="Test message" onDismiss={onDismiss} />)

      // Should only have the dismiss button, not an action button
      const buttons = screen.getAllByRole('button')
      expect(buttons).toHaveLength(1)
    })

    it('renders action button when actionLabel is provided', () => {
      const onDismiss = vi.fn()
      const onAction = vi.fn()

      render(
        <PermissionToast
          message="Test message"
          onDismiss={onDismiss}
          actionLabel="Open Settings"
          onAction={onAction}
        />,
      )

      expect(screen.getByRole('button', { name: 'Open Settings' })).toBeInTheDocument()
    })

    it('calls onAction when action button is clicked', () => {
      const onDismiss = vi.fn()
      const onAction = vi.fn()

      render(
        <PermissionToast
          message="Test message"
          onDismiss={onDismiss}
          actionLabel="Open Settings"
          onAction={onAction}
        />,
      )

      fireEvent.click(screen.getByRole('button', { name: 'Open Settings' }))

      expect(onAction).toHaveBeenCalledTimes(1)
    })
  })

  describe('variants', () => {
    it('renders with warning severity by default', () => {
      const onDismiss = vi.fn()

      render(<PermissionToast message="Test message" onDismiss={onDismiss} />)

      const alert = screen.getByRole('alert')
      expect(alert).toHaveClass('MuiAlert-standardWarning')
    })

    it('renders with error severity when variant is error', () => {
      const onDismiss = vi.fn()

      render(<PermissionToast message="Test message" onDismiss={onDismiss} variant="error" />)

      const alert = screen.getByRole('alert')
      expect(alert).toHaveClass('MuiAlert-standardError')
    })

    it('renders with warning severity when variant is warning', () => {
      const onDismiss = vi.fn()

      render(<PermissionToast message="Test message" onDismiss={onDismiss} variant="warning" />)

      const alert = screen.getByRole('alert')
      expect(alert).toHaveClass('MuiAlert-standardWarning')
    })
  })
})
