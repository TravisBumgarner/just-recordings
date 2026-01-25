import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { RecordingSettingsModal } from '../components/RecordingSettingsModal'
import { PermissionService } from '@just-recordings/recorder'

// Mock PermissionService
vi.mock('@just-recordings/recorder', async () => {
  const actual = await vi.importActual('@just-recordings/recorder')
  return {
    ...actual,
    PermissionService: vi.fn(),
  }
})

// Mock electron utils
vi.mock('../utils/electron', () => ({
  isElectronCheck: vi.fn(() => false),
}))

import { isElectronCheck } from '../utils/electron'

const mockIsElectronCheck = vi.mocked(isElectronCheck)

// Mock navigator.mediaDevices.enumerateDevices
const mockEnumerateDevices = vi.fn()

describe('RecordingSettingsModal - Icons and Device Selection', () => {
  const mockOnClose = vi.fn()
  const mockOnStartRecording = vi.fn()
  let mockPermissionService: {
    checkMicrophone: ReturnType<typeof vi.fn>
    checkCamera: ReturnType<typeof vi.fn>
  }

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    mockPermissionService = {
      checkMicrophone: vi.fn().mockResolvedValue({
        granted: false,
        state: 'prompt',
        canRequest: true,
      }),
      checkCamera: vi.fn().mockResolvedValue({
        granted: false,
        state: 'prompt',
        canRequest: true,
      }),
    }
    ;(PermissionService as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      () => mockPermissionService,
    )

    // Setup mock for enumerateDevices
    mockEnumerateDevices.mockResolvedValue([
      { kind: 'audioinput', deviceId: 'mic-1', label: 'Built-in Microphone' },
      { kind: 'audioinput', deviceId: 'mic-2', label: 'External Microphone' },
      { kind: 'videoinput', deviceId: 'cam-1', label: 'Built-in Webcam' },
      { kind: 'videoinput', deviceId: 'cam-2', label: 'External Webcam' },
    ])

    Object.defineProperty(navigator, 'mediaDevices', {
      value: {
        enumerateDevices: mockEnumerateDevices,
        getUserMedia: vi.fn().mockResolvedValue({
          getTracks: () => [{ stop: vi.fn() }],
          getAudioTracks: () => [{ stop: vi.fn() }],
          getVideoTracks: () => [{ stop: vi.fn() }],
        }),
      },
      writable: true,
      configurable: true,
    })

    mockIsElectronCheck.mockReturnValue(false)
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('icon button rendering', () => {
    it('renders microphone icon button with tooltip', async () => {
      render(
        <RecordingSettingsModal
          open={true}
          onClose={mockOnClose}
          onStartRecording={mockOnStartRecording}
        />,
      )

      await waitFor(() => {
        expect(screen.getByTestId('microphone-toggle')).toBeInTheDocument()
      })

      // Check tooltip appears on hover
      fireEvent.mouseOver(screen.getByTestId('microphone-toggle'))
      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toHaveTextContent(/microphone/i)
      })
    })

    it('renders system audio icon button with tooltip', async () => {
      render(
        <RecordingSettingsModal
          open={true}
          onClose={mockOnClose}
          onStartRecording={mockOnStartRecording}
        />,
      )

      await waitFor(() => {
        expect(screen.getByTestId('system-audio-toggle')).toBeInTheDocument()
      })

      fireEvent.mouseOver(screen.getByTestId('system-audio-toggle'))
      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toHaveTextContent(/system audio/i)
      })
    })

    it('renders webcam icon button with tooltip', async () => {
      render(
        <RecordingSettingsModal
          open={true}
          onClose={mockOnClose}
          onStartRecording={mockOnStartRecording}
        />,
      )

      await waitFor(() => {
        expect(screen.getByTestId('webcam-toggle')).toBeInTheDocument()
      })

      fireEvent.mouseOver(screen.getByTestId('webcam-toggle'))
      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toHaveTextContent(/webcam/i)
      })
    })
  })

  describe('icon button toggle states', () => {
    it('microphone icon button toggles on/off with visual state', async () => {
      render(
        <RecordingSettingsModal
          open={true}
          onClose={mockOnClose}
          onStartRecording={mockOnStartRecording}
        />,
      )

      await waitFor(() => {
        expect(screen.getByTestId('microphone-toggle')).toBeInTheDocument()
      })

      const micButton = screen.getByTestId('microphone-toggle')
      // Default is now true
      expect(micButton).toHaveAttribute('aria-pressed', 'true')

      fireEvent.click(micButton)
      expect(micButton).toHaveAttribute('aria-pressed', 'false')

      fireEvent.click(micButton)
      expect(micButton).toHaveAttribute('aria-pressed', 'true')
    })

    it('system audio icon button toggles on/off with visual state', async () => {
      render(
        <RecordingSettingsModal
          open={true}
          onClose={mockOnClose}
          onStartRecording={mockOnStartRecording}
        />,
      )

      await waitFor(() => {
        expect(screen.getByTestId('system-audio-toggle')).toBeInTheDocument()
      })

      const audioButton = screen.getByTestId('system-audio-toggle')
      // Default is now true
      expect(audioButton).toHaveAttribute('aria-pressed', 'true')

      fireEvent.click(audioButton)
      expect(audioButton).toHaveAttribute('aria-pressed', 'false')
    })

    it('webcam icon button toggles on/off with visual state', async () => {
      render(
        <RecordingSettingsModal
          open={true}
          onClose={mockOnClose}
          onStartRecording={mockOnStartRecording}
        />,
      )

      await waitFor(() => {
        expect(screen.getByTestId('webcam-toggle')).toBeInTheDocument()
      })

      const webcamButton = screen.getByTestId('webcam-toggle')
      // Default is now true
      expect(webcamButton).toHaveAttribute('aria-pressed', 'true')

      fireEvent.click(webcamButton)
      expect(webcamButton).toHaveAttribute('aria-pressed', 'false')
    })
  })

  describe('device selection dropdowns', () => {
    it('shows microphone device dropdown when microphone is enabled (default)', async () => {
      render(
        <RecordingSettingsModal
          open={true}
          onClose={mockOnClose}
          onStartRecording={mockOnStartRecording}
        />,
      )

      // Microphone is enabled by default, dropdown should appear
      await waitFor(() => {
        expect(screen.getByTestId('microphone-device-select')).toBeInTheDocument()
      })
    })

    it('shows webcam device dropdown when webcam is enabled (default)', async () => {
      render(
        <RecordingSettingsModal
          open={true}
          onClose={mockOnClose}
          onStartRecording={mockOnStartRecording}
        />,
      )

      // Webcam is enabled by default, dropdown should appear
      await waitFor(() => {
        expect(screen.getByTestId('webcam-device-select')).toBeInTheDocument()
      })
    })

    it('populates microphone dropdown with available devices', async () => {
      render(
        <RecordingSettingsModal
          open={true}
          onClose={mockOnClose}
          onStartRecording={mockOnStartRecording}
        />,
      )

      // Microphone is enabled by default
      await waitFor(() => {
        expect(screen.getByTestId('microphone-device-select')).toBeInTheDocument()
      })

      // The first device should be selected by default and displayed
      await waitFor(() => {
        expect(screen.getByText('Built-in Microphone')).toBeInTheDocument()
      })
    })

    it('hides microphone dropdown when microphone is disabled', async () => {
      render(
        <RecordingSettingsModal
          open={true}
          onClose={mockOnClose}
          onStartRecording={mockOnStartRecording}
        />,
      )

      await waitFor(() => {
        expect(screen.getByTestId('microphone-device-select')).toBeInTheDocument()
      })

      // Disable microphone
      fireEvent.click(screen.getByTestId('microphone-toggle'))

      await waitFor(() => {
        expect(screen.queryByTestId('microphone-device-select')).not.toBeInTheDocument()
      })
    })
  })

  describe('settings include device IDs', () => {
    it('includes selected microphone device ID in settings (enabled by default)', async () => {
      render(
        <RecordingSettingsModal
          open={true}
          onClose={mockOnClose}
          onStartRecording={mockOnStartRecording}
        />,
      )

      // Microphone is enabled by default
      await waitFor(() => {
        expect(screen.getByTestId('microphone-device-select')).toBeInTheDocument()
      })

      // Start recording
      fireEvent.click(screen.getByRole('button', { name: /start recording/i }))

      await waitFor(() => {
        expect(mockOnStartRecording).toHaveBeenCalledWith(
          expect.objectContaining({
            includeMicrophone: true,
            microphoneDeviceId: expect.any(String),
          }),
        )
      })
    })

    it('includes selected webcam device ID in settings (enabled by default)', async () => {
      render(
        <RecordingSettingsModal
          open={true}
          onClose={mockOnClose}
          onStartRecording={mockOnStartRecording}
        />,
      )

      // Webcam is enabled by default
      await waitFor(() => {
        expect(screen.getByTestId('webcam-device-select')).toBeInTheDocument()
      })

      // Start recording
      fireEvent.click(screen.getByRole('button', { name: /start recording/i }))

      await waitFor(() => {
        expect(mockOnStartRecording).toHaveBeenCalledWith(
          expect.objectContaining({
            includeWebcam: true,
            webcamDeviceId: expect.any(String),
          }),
        )
      })
    })
  })

  describe('desktop-only features', () => {
    beforeEach(() => {
      mockIsElectronCheck.mockReturnValue(true)
    })

    it('shows webcam preview on desktop when webcam is enabled (default)', async () => {
      render(
        <RecordingSettingsModal
          open={true}
          onClose={mockOnClose}
          onStartRecording={mockOnStartRecording}
        />,
      )

      // Webcam is enabled by default, preview should appear on desktop
      await waitFor(() => {
        expect(screen.getByTestId('webcam-preview')).toBeInTheDocument()
      })
    })

    it('shows audio level meter on desktop when microphone is enabled (default)', async () => {
      render(
        <RecordingSettingsModal
          open={true}
          onClose={mockOnClose}
          onStartRecording={mockOnStartRecording}
        />,
      )

      // Microphone is enabled by default, audio meter should appear on desktop
      await waitFor(() => {
        expect(screen.getByTestId('audio-level-meter')).toBeInTheDocument()
      })
    })

    it('does not show webcam preview on web (non-desktop)', async () => {
      mockIsElectronCheck.mockReturnValue(false)

      render(
        <RecordingSettingsModal
          open={true}
          onClose={mockOnClose}
          onStartRecording={mockOnStartRecording}
        />,
      )

      // Webcam is enabled by default but preview shouldn't show on web
      await waitFor(() => {
        expect(screen.getByTestId('webcam-device-select')).toBeInTheDocument()
      })

      expect(screen.queryByTestId('webcam-preview')).not.toBeInTheDocument()
    })

    it('does not show audio level meter on web (non-desktop)', async () => {
      mockIsElectronCheck.mockReturnValue(false)

      render(
        <RecordingSettingsModal
          open={true}
          onClose={mockOnClose}
          onStartRecording={mockOnStartRecording}
        />,
      )

      // Microphone is enabled by default but meter shouldn't show on web
      await waitFor(() => {
        expect(screen.getByTestId('microphone-device-select')).toBeInTheDocument()
      })

      expect(screen.queryByTestId('audio-level-meter')).not.toBeInTheDocument()
    })
  })
})
