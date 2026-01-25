import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { FloatingControlsContent } from '../components/FloatingControlsContent'
import type { RecordingState } from '../pages/FloatingControls'

function createRecordingState(overrides: Partial<RecordingState> = {}): RecordingState {
  return {
    status: 'recording',
    elapsedTimeMs: 0,
    webcamEnabled: false,
    ...overrides,
  }
}

describe('FloatingControlsContent', () => {
  const defaultProps = {
    recordingState: createRecordingState(),
    onAction: vi.fn(),
  }

  describe('recording state indicator', () => {
    it('displays recording indicator when status is recording', () => {
      const state = createRecordingState({ status: 'recording' })

      render(<FloatingControlsContent {...defaultProps} recordingState={state} />)

      expect(screen.getByTestId('state-indicator')).toHaveTextContent(/recording/i)
    })

    it('displays paused indicator when status is paused', () => {
      const state = createRecordingState({ status: 'paused' })

      render(<FloatingControlsContent {...defaultProps} recordingState={state} />)

      expect(screen.getByTestId('state-indicator')).toHaveTextContent(/paused/i)
    })
  })

  describe('elapsed time display', () => {
    it('displays elapsed time in MM:SS format', () => {
      const state = createRecordingState({ elapsedTimeMs: 65000 }) // 1:05

      render(<FloatingControlsContent {...defaultProps} recordingState={state} />)

      expect(screen.getByTestId('elapsed-time')).toHaveTextContent('01:05')
    })

    it('displays zero time as 00:00', () => {
      const state = createRecordingState({ elapsedTimeMs: 0 })

      render(<FloatingControlsContent {...defaultProps} recordingState={state} />)

      expect(screen.getByTestId('elapsed-time')).toHaveTextContent('00:00')
    })

    it('displays hours when elapsed time exceeds 60 minutes', () => {
      const state = createRecordingState({ elapsedTimeMs: 3665000 }) // 1:01:05

      render(<FloatingControlsContent {...defaultProps} recordingState={state} />)

      expect(screen.getByTestId('elapsed-time')).toHaveTextContent('01:01:05')
    })
  })

  describe('pause/resume button', () => {
    it('shows pause button when recording', () => {
      const state = createRecordingState({ status: 'recording' })

      render(<FloatingControlsContent {...defaultProps} recordingState={state} />)

      expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument()
    })

    it('shows resume button when paused', () => {
      const state = createRecordingState({ status: 'paused' })

      render(<FloatingControlsContent {...defaultProps} recordingState={state} />)

      expect(screen.getByRole('button', { name: /resume/i })).toBeInTheDocument()
    })

    it('calls onAction with pause when pause button clicked', () => {
      const onAction = vi.fn()
      const state = createRecordingState({ status: 'recording' })

      render(<FloatingControlsContent recordingState={state} onAction={onAction} />)
      fireEvent.click(screen.getByRole('button', { name: /pause/i }))

      expect(onAction).toHaveBeenCalledWith('pause')
    })

    it('calls onAction with resume when resume button clicked', () => {
      const onAction = vi.fn()
      const state = createRecordingState({ status: 'paused' })

      render(<FloatingControlsContent recordingState={state} onAction={onAction} />)
      fireEvent.click(screen.getByRole('button', { name: /resume/i }))

      expect(onAction).toHaveBeenCalledWith('resume')
    })
  })

  describe('stop button', () => {
    it('renders stop button', () => {
      render(<FloatingControlsContent {...defaultProps} />)

      expect(screen.getByRole('button', { name: /stop/i })).toBeInTheDocument()
    })

    it('calls onAction with stop when stop button clicked', () => {
      const onAction = vi.fn()

      render(<FloatingControlsContent {...defaultProps} onAction={onAction} />)
      fireEvent.click(screen.getByRole('button', { name: /stop/i }))

      expect(onAction).toHaveBeenCalledWith('stop')
    })
  })

  describe('cancel button with confirmation', () => {
    it('renders cancel button', () => {
      render(<FloatingControlsContent {...defaultProps} />)

      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
    })

    it('shows confirmation dialog when cancel button clicked', () => {
      render(<FloatingControlsContent {...defaultProps} />)

      fireEvent.click(screen.getByRole('button', { name: /cancel/i }))

      expect(screen.getByTestId('confirmation-dialog')).toBeInTheDocument()
    })

    it('calls onAction with cancel when cancel is confirmed', () => {
      const onAction = vi.fn()

      render(<FloatingControlsContent {...defaultProps} onAction={onAction} />)
      fireEvent.click(screen.getByRole('button', { name: /cancel/i }))
      fireEvent.click(screen.getByRole('button', { name: /confirm/i }))

      expect(onAction).toHaveBeenCalledWith('cancel')
    })

    it('does not call onAction when cancel confirmation is dismissed', () => {
      const onAction = vi.fn()

      render(<FloatingControlsContent {...defaultProps} onAction={onAction} />)
      fireEvent.click(screen.getByRole('button', { name: /cancel/i }))
      fireEvent.click(screen.getByRole('button', { name: /go back/i }))

      expect(onAction).not.toHaveBeenCalled()
    })

    it('hides confirmation dialog when dismissed', () => {
      render(<FloatingControlsContent {...defaultProps} />)

      fireEvent.click(screen.getByRole('button', { name: /cancel/i }))
      fireEvent.click(screen.getByRole('button', { name: /go back/i }))

      expect(screen.queryByTestId('confirmation-dialog')).not.toBeInTheDocument()
    })
  })

  describe('titlebar for window dragging', () => {
    it('renders a draggable titlebar area', () => {
      render(<FloatingControlsContent {...defaultProps} />)

      const titlebar = screen.getByTestId('titlebar')
      expect(titlebar).toBeInTheDocument()
    })

    it('titlebar has app-region drag style for Electron', () => {
      render(<FloatingControlsContent {...defaultProps} />)

      const titlebar = screen.getByTestId('titlebar')
      expect(titlebar).toHaveStyle({ WebkitAppRegion: 'drag' })
    })
  })
})
