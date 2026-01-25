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

  describe('elapsed time element', () => {
    it('renders elapsed time element (hidden)', () => {
      const state = createRecordingState({ elapsedTimeMs: 65000 })

      render(<FloatingControlsContent {...defaultProps} recordingState={state} />)

      // Elapsed time element exists but is hidden in compact icon view
      expect(screen.getByTestId('elapsed-time')).toBeInTheDocument()
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

  describe('cancel button', () => {
    it('renders cancel button', () => {
      render(<FloatingControlsContent {...defaultProps} />)

      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
    })

    it('calls onAction with cancel immediately when clicked (no confirmation)', () => {
      const onAction = vi.fn()

      render(<FloatingControlsContent {...defaultProps} onAction={onAction} />)
      fireEvent.click(screen.getByRole('button', { name: /cancel/i }))

      expect(onAction).toHaveBeenCalledWith('cancel')
    })
  })

  describe('titlebar for window dragging', () => {
    it('renders a draggable titlebar area', () => {
      render(<FloatingControlsContent {...defaultProps} />)

      const titlebar = screen.getByTestId('titlebar')
      expect(titlebar).toBeInTheDocument()
    })

    it('titlebar has cursor style indicating draggability', () => {
      render(<FloatingControlsContent {...defaultProps} />)

      const titlebar = screen.getByTestId('titlebar')
      // Note: WebkitAppRegion: 'drag' is set for Electron but cannot be tested in jsdom
      // Instead, we verify the cursor style which indicates drag functionality
      expect(titlebar).toHaveStyle({ cursor: 'move' })
    })
  })
})
