import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { SetupWizard } from '../components/SetupWizard'

describe('SetupWizard', () => {
  const mockOnComplete = vi.fn()
  const mockMarkSetupComplete = vi.fn()
  const mockOpenSystemPreferences = vi.fn()
  const mockSetSetupMode = vi.fn()

  afterEach(() => {
    vi.clearAllMocks()
    delete (window as { api?: unknown }).api
  })

  const renderWizard = (isSetupComplete = false) => {
    // Mock window.api for Electron environment
    ;(window as { api?: unknown }).api = {
      openSystemPreferences: mockOpenSystemPreferences,
      setRecordingState: vi.fn(),
      setSetupMode: mockSetSetupMode,
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

    it('has a Test Screen Recording button', () => {
      renderWizard()

      // Go to Screen Recording step
      fireEvent.click(screen.getByRole('button', { name: /next/i }))

      expect(screen.getByRole('button', { name: /test.*screen.*recording/i })).toBeInTheDocument()
    })
  })

  describe('screen recording test', () => {
    let mockGetDisplayMedia: ReturnType<typeof vi.fn>
    let mockMediaStream: { getTracks: () => { stop: () => void }[] }

    beforeEach(() => {
      mockMediaStream = {
        getTracks: () => [{ stop: vi.fn() }],
      }
      mockGetDisplayMedia = vi.fn()
      Object.defineProperty(navigator, 'mediaDevices', {
        value: { getDisplayMedia: mockGetDisplayMedia },
        configurable: true,
      })
    })

    it('shows testing state when Test Screen Recording is clicked', async () => {
      // Make getDisplayMedia hang to keep testing state visible
      mockGetDisplayMedia.mockReturnValue(new Promise(() => {}))

      renderWizard()

      // Go to Screen Recording step
      fireEvent.click(screen.getByRole('button', { name: /next/i }))

      // Click test button
      fireEvent.click(screen.getByRole('button', { name: /test.*screen.*recording/i }))

      expect(screen.getByTestId('permission-test-result')).toHaveAttribute('data-state', 'testing')
    })

    it('shows success when getDisplayMedia succeeds', async () => {
      mockGetDisplayMedia.mockResolvedValue(mockMediaStream)

      renderWizard()

      // Go to Screen Recording step
      fireEvent.click(screen.getByRole('button', { name: /next/i }))

      // Click test button
      fireEvent.click(screen.getByRole('button', { name: /test.*screen.*recording/i }))

      await waitFor(() => {
        expect(screen.getByTestId('permission-test-result')).toHaveAttribute('data-state', 'success')
      })
    })

    it('stops all tracks after successful test', async () => {
      const mockStop = vi.fn()
      mockMediaStream = {
        getTracks: () => [{ stop: mockStop }, { stop: mockStop }],
      }
      mockGetDisplayMedia.mockResolvedValue(mockMediaStream)

      renderWizard()

      // Go to Screen Recording step
      fireEvent.click(screen.getByRole('button', { name: /next/i }))

      // Click test button
      fireEvent.click(screen.getByRole('button', { name: /test.*screen.*recording/i }))

      await waitFor(() => {
        expect(mockStop).toHaveBeenCalledTimes(2)
      })
    })

    it('shows failed when getDisplayMedia is denied', async () => {
      mockGetDisplayMedia.mockRejectedValue(new Error('Permission denied'))

      renderWizard()

      // Go to Screen Recording step
      fireEvent.click(screen.getByRole('button', { name: /next/i }))

      // Click test button
      fireEvent.click(screen.getByRole('button', { name: /test.*screen.*recording/i }))

      await waitFor(() => {
        expect(screen.getByTestId('permission-test-result')).toHaveAttribute('data-state', 'failed')
      })
    })

    it('can retry test after failure', async () => {
      // First attempt fails
      mockGetDisplayMedia.mockRejectedValueOnce(new Error('Permission denied'))
      // Second attempt succeeds
      mockGetDisplayMedia.mockResolvedValueOnce(mockMediaStream)

      renderWizard()

      // Go to Screen Recording step
      fireEvent.click(screen.getByRole('button', { name: /next/i }))

      // First test - fails
      fireEvent.click(screen.getByRole('button', { name: /test.*screen.*recording/i }))

      await waitFor(() => {
        expect(screen.getByTestId('permission-test-result')).toHaveAttribute('data-state', 'failed')
      })

      // Second test - succeeds
      fireEvent.click(screen.getByRole('button', { name: /test.*screen.*recording/i }))

      await waitFor(() => {
        expect(screen.getByTestId('permission-test-result')).toHaveAttribute('data-state', 'success')
      })
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

  describe('setup mode', () => {
    it('calls setSetupMode(true) when wizard mounts', () => {
      renderWizard()

      expect(mockSetSetupMode).toHaveBeenCalledWith(true)
    })

    it('does not call setSetupMode when isSetupComplete is true', () => {
      renderWizard(true)

      expect(mockSetSetupMode).not.toHaveBeenCalled()
    })

    it('calls setSetupMode(false) when Get Started is clicked', () => {
      renderWizard()

      // Clear the initial mount call
      mockSetSetupMode.mockClear()

      // Navigate to complete step
      fireEvent.click(screen.getByRole('button', { name: /next/i }))
      fireEvent.click(screen.getByRole('button', { name: /next/i }))

      // Click Get Started
      fireEvent.click(screen.getByRole('button', { name: /finish|get started|done/i }))

      expect(mockSetSetupMode).toHaveBeenCalledWith(false)
    })
  })
})
