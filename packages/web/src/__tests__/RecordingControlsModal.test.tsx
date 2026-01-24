import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { RecordingControlsModal } from '../components/RecordingControlsModal'

describe('RecordingControlsModal', () => {
  const defaultProps = {
    open: true,
    recorderState: 'recording' as const,
    getElapsedTime: vi.fn(() => 0),
    onStop: vi.fn(),
    onPause: vi.fn(),
    onResume: vi.fn(),
    onRestart: vi.fn(),
    onCancel: vi.fn(),
  }

  beforeEach(() => {
    vi.useFakeTimers()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('modal visibility', () => {
    it('renders when open is true', () => {
      render(<RecordingControlsModal {...defaultProps} open={true} />)

      expect(screen.getByTestId('recording-controls-modal')).toBeInTheDocument()
    })

    it('does not render when open is false', () => {
      render(<RecordingControlsModal {...defaultProps} open={false} />)

      expect(screen.queryByTestId('recording-controls-modal')).not.toBeInTheDocument()
    })
  })

  describe('recording timer display', () => {
    it('displays elapsed recording time via RecordingTimer', () => {
      const getElapsedTime = vi.fn(() => 65000) // 1:05

      render(<RecordingControlsModal {...defaultProps} getElapsedTime={getElapsedTime} />)

      expect(screen.getByTestId('recording-timer')).toHaveTextContent('01:05')
    })
  })

  describe('state indicator', () => {
    it('shows recording state indicator when recording', () => {
      render(<RecordingControlsModal {...defaultProps} recorderState="recording" />)

      expect(screen.getByTestId('state-indicator')).toHaveTextContent(/recording/i)
    })

    it('shows paused state indicator when paused', () => {
      render(<RecordingControlsModal {...defaultProps} recorderState="paused" />)

      expect(screen.getByTestId('state-indicator')).toHaveTextContent(/paused/i)
    })
  })

  describe('control buttons', () => {
    it('renders stop button', () => {
      render(<RecordingControlsModal {...defaultProps} />)

      expect(screen.getByRole('button', { name: /stop/i })).toBeInTheDocument()
    })

    it('renders pause button when recording', () => {
      render(<RecordingControlsModal {...defaultProps} recorderState="recording" />)

      expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument()
    })

    it('renders resume button when paused', () => {
      render(<RecordingControlsModal {...defaultProps} recorderState="paused" />)

      expect(screen.getByRole('button', { name: /resume/i })).toBeInTheDocument()
    })

    it('renders restart button', () => {
      render(<RecordingControlsModal {...defaultProps} />)

      expect(screen.getByRole('button', { name: /restart/i })).toBeInTheDocument()
    })

    it('renders cancel button', () => {
      render(<RecordingControlsModal {...defaultProps} />)

      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
    })
  })

  describe('button actions', () => {
    it('calls onStop when stop button is clicked', () => {
      const onStop = vi.fn()

      render(<RecordingControlsModal {...defaultProps} onStop={onStop} />)
      fireEvent.click(screen.getByRole('button', { name: /stop/i }))

      expect(onStop).toHaveBeenCalledTimes(1)
    })

    it('calls onPause when pause button is clicked while recording', () => {
      const onPause = vi.fn()

      render(
        <RecordingControlsModal {...defaultProps} recorderState="recording" onPause={onPause} />,
      )
      fireEvent.click(screen.getByRole('button', { name: /pause/i }))

      expect(onPause).toHaveBeenCalledTimes(1)
    })

    it('calls onResume when resume button is clicked while paused', () => {
      const onResume = vi.fn()

      render(<RecordingControlsModal {...defaultProps} recorderState="paused" onResume={onResume} />)
      fireEvent.click(screen.getByRole('button', { name: /resume/i }))

      expect(onResume).toHaveBeenCalledTimes(1)
    })
  })

  describe('confirmation dialogs', () => {
    it('shows confirmation dialog when restart button is clicked', () => {
      render(<RecordingControlsModal {...defaultProps} />)

      fireEvent.click(screen.getByRole('button', { name: /restart/i }))

      expect(screen.getByTestId('confirmation-dialog')).toBeInTheDocument()
      expect(screen.getByText(/discard/i)).toBeInTheDocument()
    })

    it('calls onRestart when restart is confirmed', () => {
      const onRestart = vi.fn()

      render(<RecordingControlsModal {...defaultProps} onRestart={onRestart} />)
      fireEvent.click(screen.getByRole('button', { name: /restart/i }))
      fireEvent.click(screen.getByRole('button', { name: /confirm/i }))

      expect(onRestart).toHaveBeenCalledTimes(1)
    })

    it('does not call onRestart when restart confirmation is cancelled', () => {
      const onRestart = vi.fn()

      render(<RecordingControlsModal {...defaultProps} onRestart={onRestart} />)
      fireEvent.click(screen.getByRole('button', { name: /restart/i }))
      fireEvent.click(screen.getByRole('button', { name: /go back/i }))

      expect(onRestart).not.toHaveBeenCalled()
      expect(screen.queryByTestId('confirmation-dialog')).not.toBeInTheDocument()
    })

    it('shows confirmation dialog when cancel button is clicked', () => {
      render(<RecordingControlsModal {...defaultProps} />)

      fireEvent.click(screen.getByRole('button', { name: /cancel/i }))

      expect(screen.getByTestId('confirmation-dialog')).toBeInTheDocument()
      expect(screen.getByText(/discard/i)).toBeInTheDocument()
    })

    it('calls onCancel when cancel is confirmed', () => {
      const onCancel = vi.fn()

      render(<RecordingControlsModal {...defaultProps} onCancel={onCancel} />)
      fireEvent.click(screen.getByRole('button', { name: /cancel/i }))
      fireEvent.click(screen.getByRole('button', { name: /confirm/i }))

      expect(onCancel).toHaveBeenCalledTimes(1)
    })

    it('does not call onCancel when cancel confirmation is cancelled', () => {
      const onCancel = vi.fn()

      render(<RecordingControlsModal {...defaultProps} onCancel={onCancel} />)
      fireEvent.click(screen.getByRole('button', { name: /cancel/i }))
      fireEvent.click(screen.getByRole('button', { name: /go back/i }))

      expect(onCancel).not.toHaveBeenCalled()
      expect(screen.queryByTestId('confirmation-dialog')).not.toBeInTheDocument()
    })
  })
})
