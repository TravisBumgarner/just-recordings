import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { PermissionStatus } from '@just-recordings/recorder'
import { PermissionStatusBadge } from '../components/PermissionStatusBadge'

describe('PermissionStatusBadge', () => {
  describe('granted state', () => {
    it('renders with granted styling', () => {
      const status: PermissionStatus = { granted: true, state: 'granted', canRequest: false }

      render(<PermissionStatusBadge status={status} label="Microphone" />)

      const badge = screen.getByTestId('permission-badge')
      expect(badge).toHaveAttribute('data-state', 'granted')
    })

    it('displays the label text', () => {
      const status: PermissionStatus = { granted: true, state: 'granted', canRequest: false }

      render(<PermissionStatusBadge status={status} label="Microphone" />)

      expect(screen.getByText(/Microphone/)).toBeInTheDocument()
    })
  })

  describe('prompt state', () => {
    it('renders with prompt styling', () => {
      const status: PermissionStatus = { granted: false, state: 'prompt', canRequest: true }

      render(<PermissionStatusBadge status={status} label="Camera" />)

      const badge = screen.getByTestId('permission-badge')
      expect(badge).toHaveAttribute('data-state', 'prompt')
    })

    it('displays the label text', () => {
      const status: PermissionStatus = { granted: false, state: 'prompt', canRequest: true }

      render(<PermissionStatusBadge status={status} label="Camera" />)

      expect(screen.getByText(/Camera/)).toBeInTheDocument()
    })
  })

  describe('denied state', () => {
    it('renders with denied styling', () => {
      const status: PermissionStatus = { granted: false, state: 'denied', canRequest: false }

      render(<PermissionStatusBadge status={status} label="Microphone" />)

      const badge = screen.getByTestId('permission-badge')
      expect(badge).toHaveAttribute('data-state', 'denied')
    })

    it('displays the label text', () => {
      const status: PermissionStatus = { granted: false, state: 'denied', canRequest: false }

      render(<PermissionStatusBadge status={status} label="Microphone" />)

      expect(screen.getByText(/Microphone/)).toBeInTheDocument()
    })
  })

  describe('unsupported state', () => {
    it('renders with unsupported styling', () => {
      const status: PermissionStatus = { granted: false, state: 'unsupported', canRequest: true }

      render(<PermissionStatusBadge status={status} label="Screen Recording" />)

      const badge = screen.getByTestId('permission-badge')
      expect(badge).toHaveAttribute('data-state', 'unsupported')
    })

    it('displays the label text', () => {
      const status: PermissionStatus = { granted: false, state: 'unsupported', canRequest: true }

      render(<PermissionStatusBadge status={status} label="Screen Recording" />)

      expect(screen.getByText(/Screen Recording/)).toBeInTheDocument()
    })
  })

  describe('compact display', () => {
    it('renders as inline element', () => {
      const status: PermissionStatus = { granted: true, state: 'granted', canRequest: false }

      render(<PermissionStatusBadge status={status} label="Microphone" />)

      const badge = screen.getByTestId('permission-badge')
      expect(badge.tagName.toLowerCase()).toBe('span')
    })
  })
})
