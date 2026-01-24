import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { SetupWizard } from '../components/SetupWizard'

describe('SetupWizard', () => {
  const mockOnComplete = vi.fn()
  const mockMarkSetupComplete = vi.fn()
  const mockOpenSystemPreferences = vi.fn()

  afterEach(() => {
    vi.clearAllMocks()
    delete (window as { api?: unknown }).api
  })

  const renderWizard = (isSetupComplete = false) => {
    // Mock window.api for Electron environment
    ;(window as { api?: unknown }).api = {
      openSystemPreferences: mockOpenSystemPreferences,
      setRecordingState: vi.fn(),
      getVersions: vi.fn(),
    }

    return render(
      <SetupWizard
        isSetupComplete={isSetupComplete}
        onComplete={mockOnComplete}
        markSetupComplete={mockMarkSetupComplete}
      />,
    )
  }

  describe('visibility', () => {
    it('does not render when isSetupComplete is true', () => {
      renderWizard(true)

      expect(screen.queryByTestId('setup-wizard')).not.toBeInTheDocument()
    })

    it('renders when isSetupComplete is false', () => {
      renderWizard(false)

      expect(screen.getByTestId('setup-wizard')).toBeInTheDocument()
    })
  })

  describe('welcome step', () => {
    it('shows welcome step initially', () => {
      renderWizard()

      expect(screen.getByText(/welcome/i)).toBeInTheDocument()
    })

    it('has a Next button on welcome step', () => {
      renderWizard()

      expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument()
    })
  })

  describe('step navigation', () => {
    it('advances to Screen Recording step when Next is clicked on Welcome', () => {
      renderWizard()

      fireEvent.click(screen.getByRole('button', { name: /next/i }))

      expect(screen.getByText(/screen recording/i)).toBeInTheDocument()
    })

    it('advances to Complete step when Next is clicked on Screen Recording', () => {
      renderWizard()

      // Go to Screen Recording step
      fireEvent.click(screen.getByRole('button', { name: /next/i }))
      // Go to Complete step
      fireEvent.click(screen.getByRole('button', { name: /next/i }))

      expect(screen.getByText(/complete|ready|all set/i)).toBeInTheDocument()
    })
  })

  describe('screen recording step', () => {
    it('has a button to open System Preferences', () => {
      renderWizard()

      // Go to Screen Recording step
      fireEvent.click(screen.getByRole('button', { name: /next/i }))

      expect(
        screen.getByRole('button', { name: /open.*preferences|open.*settings/i }),
      ).toBeInTheDocument()
    })

    it('calls openSystemPreferences when button is clicked', () => {
      renderWizard()

      // Go to Screen Recording step
      fireEvent.click(screen.getByRole('button', { name: /next/i }))
      fireEvent.click(screen.getByRole('button', { name: /open.*preferences|open.*settings/i }))

      expect(mockOpenSystemPreferences).toHaveBeenCalledWith('screenRecording')
    })
  })

  describe('complete step', () => {
    it('has a button that calls onComplete', () => {
      renderWizard()

      // Go to Screen Recording step
      fireEvent.click(screen.getByRole('button', { name: /next/i }))
      // Go to Complete step
      fireEvent.click(screen.getByRole('button', { name: /next/i }))

      const finishButton = screen.getByRole('button', { name: /finish|get started|done/i })
      fireEvent.click(finishButton)

      expect(mockOnComplete).toHaveBeenCalledTimes(1)
    })

    it('calls markSetupComplete when completing wizard', () => {
      renderWizard()

      // Go to Screen Recording step
      fireEvent.click(screen.getByRole('button', { name: /next/i }))
      // Go to Complete step
      fireEvent.click(screen.getByRole('button', { name: /next/i }))

      const finishButton = screen.getByRole('button', { name: /finish|get started|done/i })
      fireEvent.click(finishButton)

      expect(mockMarkSetupComplete).toHaveBeenCalledTimes(1)
    })
  })
})
