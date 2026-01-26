import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  RecordingNameModal,
  generateDefaultRecordingName,
} from '../components/RecordingNameModal'

describe('RecordingNameModal', () => {
  const mockOnSave = vi.fn()
  const mockOnCancel = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('when open', () => {
    it('renders the modal with title', () => {
      render(
        <RecordingNameModal
          open={true}
          defaultName="Recording Jan 26, 2026 2:30 PM"
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      )

      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText(/name your recording/i)).toBeInTheDocument()
    })

    it('pre-fills input with default name', () => {
      render(
        <RecordingNameModal
          open={true}
          defaultName="Recording Jan 26, 2026 2:30 PM"
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      )

      const input = screen.getByTestId('recording-name-input')
      expect(input).toHaveValue('Recording Jan 26, 2026 2:30 PM')
    })

    it('allows user to change the name', () => {
      render(
        <RecordingNameModal
          open={true}
          defaultName="Recording Jan 26, 2026 2:30 PM"
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      )

      const input = screen.getByTestId('recording-name-input')
      fireEvent.change(input, { target: { value: 'My Custom Recording' } })

      expect(input).toHaveValue('My Custom Recording')
    })
  })

  describe('save action', () => {
    it('calls onSave with the entered name when Save is clicked', () => {
      render(
        <RecordingNameModal
          open={true}
          defaultName="Recording Jan 26, 2026 2:30 PM"
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      )

      const input = screen.getByTestId('recording-name-input')
      fireEvent.change(input, { target: { value: 'My Custom Recording' } })
      fireEvent.click(screen.getByRole('button', { name: /save/i }))

      expect(mockOnSave).toHaveBeenCalledWith('My Custom Recording')
    })

    it('calls onSave with default name when user accepts without changes', () => {
      render(
        <RecordingNameModal
          open={true}
          defaultName="Recording Jan 26, 2026 2:30 PM"
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      )

      fireEvent.click(screen.getByRole('button', { name: /save/i }))

      expect(mockOnSave).toHaveBeenCalledWith('Recording Jan 26, 2026 2:30 PM')
    })

    it('trims whitespace from the name', () => {
      render(
        <RecordingNameModal
          open={true}
          defaultName="Recording"
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      )

      const input = screen.getByTestId('recording-name-input')
      fireEvent.change(input, { target: { value: '  My Recording  ' } })
      fireEvent.click(screen.getByRole('button', { name: /save/i }))

      expect(mockOnSave).toHaveBeenCalledWith('My Recording')
    })

    it('uses default name if user clears input and saves', () => {
      render(
        <RecordingNameModal
          open={true}
          defaultName="Recording Jan 26, 2026 2:30 PM"
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      )

      const input = screen.getByTestId('recording-name-input')
      fireEvent.change(input, { target: { value: '' } })
      fireEvent.click(screen.getByRole('button', { name: /save/i }))

      expect(mockOnSave).toHaveBeenCalledWith('Recording Jan 26, 2026 2:30 PM')
    })
  })

  describe('cancel action', () => {
    it('calls onCancel when Cancel is clicked', () => {
      render(
        <RecordingNameModal
          open={true}
          defaultName="Recording Jan 26, 2026 2:30 PM"
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      )

      fireEvent.click(screen.getByRole('button', { name: /cancel/i }))

      expect(mockOnCancel).toHaveBeenCalled()
    })
  })

  describe('when closed', () => {
    it('does not render when open is false', () => {
      render(
        <RecordingNameModal
          open={false}
          defaultName="Recording"
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      )

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })
})

describe('generateDefaultRecordingName', () => {
  it('generates name with formatted date and time', () => {
    const date = new Date('2026-01-26T14:30:00')
    const name = generateDefaultRecordingName(date)

    expect(name).toBe('Recording Jan 26, 2026 2:30 PM')
  })

  it('handles different dates correctly', () => {
    const date = new Date('2026-12-01T09:05:00')
    const name = generateDefaultRecordingName(date)

    expect(name).toBe('Recording Dec 1, 2026 9:05 AM')
  })

  it('uses current date when no date provided', () => {
    const name = generateDefaultRecordingName()

    expect(name).toMatch(/^Recording [A-Z][a-z]+ \d{1,2}, \d{4} \d{1,2}:\d{2} [AP]M$/)
  })
})
