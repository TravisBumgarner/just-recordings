import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PermissionTestResult } from '../components/PermissionTestResult'

describe('PermissionTestResult', () => {
  describe('idle state', () => {
    it('renders nothing when idle', () => {
      const { container } = render(<PermissionTestResult state="idle" />)

      expect(container).toBeEmptyDOMElement()
    })
  })

  describe('testing state', () => {
    it('shows a spinner', () => {
      render(<PermissionTestResult state="testing" />)

      expect(screen.getByRole('progressbar')).toBeInTheDocument()
    })

    it('shows "Testing..." text', () => {
      render(<PermissionTestResult state="testing" />)

      expect(screen.getByText('Testing...')).toBeInTheDocument()
    })

    it('has testing data-state attribute', () => {
      render(<PermissionTestResult state="testing" />)

      expect(screen.getByTestId('permission-test-result')).toHaveAttribute('data-state', 'testing')
    })
  })

  describe('success state', () => {
    it('shows checkmark icon', () => {
      render(<PermissionTestResult state="success" />)

      expect(screen.getByText('✓')).toBeInTheDocument()
    })

    it('shows default success message', () => {
      render(<PermissionTestResult state="success" />)

      expect(screen.getByText('Permission granted')).toBeInTheDocument()
    })

    it('shows custom success message when provided', () => {
      render(<PermissionTestResult state="success" successMessage="Screen recording works!" />)

      expect(screen.getByText('Screen recording works!')).toBeInTheDocument()
    })

    it('has success data-state attribute', () => {
      render(<PermissionTestResult state="success" />)

      expect(screen.getByTestId('permission-test-result')).toHaveAttribute('data-state', 'success')
    })
  })

  describe('failed state', () => {
    it('shows X icon', () => {
      render(<PermissionTestResult state="failed" />)

      expect(screen.getByText('✗')).toBeInTheDocument()
    })

    it('shows default failed message', () => {
      render(<PermissionTestResult state="failed" />)

      expect(screen.getByText('Permission denied')).toBeInTheDocument()
    })

    it('shows custom failed message when provided', () => {
      render(<PermissionTestResult state="failed" failedMessage="Please grant access in Settings" />)

      expect(screen.getByText('Please grant access in Settings')).toBeInTheDocument()
    })

    it('has failed data-state attribute', () => {
      render(<PermissionTestResult state="failed" />)

      expect(screen.getByTestId('permission-test-result')).toHaveAttribute('data-state', 'failed')
    })
  })

  describe('accessibility', () => {
    it('has aria-live for dynamic updates', () => {
      render(<PermissionTestResult state="success" />)

      expect(screen.getByTestId('permission-test-result')).toHaveAttribute('aria-live', 'polite')
    })

    it('has accessible label for testing state', () => {
      render(<PermissionTestResult state="testing" />)

      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-label', 'Testing permission')
    })
  })
})
