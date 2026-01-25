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

// Mock navigator.mediaDevices.enumerateDevices
const mockEnumerateDevices = vi.fn()

describe('RecordingSettingsModal', () => {
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
      { kind: 'videoinput', deviceId: 'cam-1', label: 'Built-in Webcam' },
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
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('icon button rendering', () => {
    it('renders with three icon buttons for audio/video sources', async () => {
      render(
        <RecordingSettingsModal
          open={true}
          onClose={mockOnClose}
          onStartRecording={mockOnStartRecording}
        />,
      )

      await waitFor(() => {
        expect(screen.getByTestId('system-audio-toggle')).toBeInTheDocument()
        expect(screen.getByTestId('microphone-toggle')).toBeInTheDocument()
        expect(screen.getByTestId('webcam-toggle')).toBeInTheDocument()
      })
    })
  })

  describe('icon button toggleability', () => {
    it('system audio icon button is independently toggleable', async () => {
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

      const systemAudioButton = screen.getByTestId('system-audio-toggle')
      // Default is now true
      expect(systemAudioButton).toHaveAttribute('aria-pressed', 'true')

      fireEvent.click(systemAudioButton)
      expect(systemAudioButton).toHaveAttribute('aria-pressed', 'false')

      fireEvent.click(systemAudioButton)
      expect(systemAudioButton).toHaveAttribute('aria-pressed', 'true')
    })

    it('microphone icon button is independently toggleable', async () => {
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

      const microphoneButton = screen.getByTestId('microphone-toggle')
      // Default is now true
      expect(microphoneButton).toHaveAttribute('aria-pressed', 'true')

      fireEvent.click(microphoneButton)
      expect(microphoneButton).toHaveAttribute('aria-pressed', 'false')
    })

    it('webcam icon button is independently toggleable', async () => {
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

  describe('start button', () => {
    it('passes settings to onStartRecording callback', async () => {
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

      // All settings default to true now, toggle webcam OFF to test mixed states
      fireEvent.click(screen.getByTestId('webcam-toggle'))

      // Click start
      fireEvent.click(screen.getByRole('button', { name: /start recording/i }))

      await waitFor(() => {
        expect(mockOnStartRecording).toHaveBeenCalledWith(
          expect.objectContaining({
            includeSystemAudio: true,
            includeMicrophone: true,
            includeWebcam: false,
            autoUpload: true,
          }),
        )
      })
    })
  })

  describe('cancel button', () => {
    it('calls onClose when cancel button is clicked', async () => {
      render(
        <RecordingSettingsModal
          open={true}
          onClose={mockOnClose}
          onStartRecording={mockOnStartRecording}
        />,
      )

      fireEvent.click(screen.getByRole('button', { name: /cancel/i }))

      expect(mockOnClose).toHaveBeenCalled()
    })
  })

  describe('modal visibility', () => {
    it('does not render when open is false', () => {
      render(
        <RecordingSettingsModal
          open={false}
          onClose={mockOnClose}
          onStartRecording={mockOnStartRecording}
        />,
      )

      expect(screen.queryByTestId('recording-settings-modal')).not.toBeInTheDocument()
    })

    it('renders when open is true', () => {
      render(
        <RecordingSettingsModal
          open={true}
          onClose={mockOnClose}
          onStartRecording={mockOnStartRecording}
        />,
      )

      expect(screen.getByTestId('recording-settings-modal')).toBeInTheDocument()
    })
  })

  describe('auto-upload setting', () => {
    it('includes autoUpload from localStorage in settings when starting recording', () => {
      render(
        <RecordingSettingsModal
          open={true}
          onClose={mockOnClose}
          onStartRecording={mockOnStartRecording}
        />,
      )

      fireEvent.click(screen.getByRole('button', { name: /start recording/i }))

      expect(mockOnStartRecording).toHaveBeenCalledWith(
        expect.objectContaining({
          autoUpload: true,
        }),
      )
    })

    it('includes autoUpload: false when localStorage has false', () => {
      localStorage.setItem('just-recordings-auto-upload', 'false')

      render(
        <RecordingSettingsModal
          open={true}
          onClose={mockOnClose}
          onStartRecording={mockOnStartRecording}
        />,
      )

      fireEvent.click(screen.getByRole('button', { name: /start recording/i }))

      expect(mockOnStartRecording).toHaveBeenCalledWith(
        expect.objectContaining({
          autoUpload: false,
        }),
      )
    })
  })
})
