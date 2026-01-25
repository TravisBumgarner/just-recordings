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
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('checkbox rendering', () => {
    it('renders with three checkboxes for audio/video sources', async () => {
      render(
        <RecordingSettingsModal
          open={true}
          onClose={mockOnClose}
          onStartRecording={mockOnStartRecording}
        />,
      )

      await waitFor(() => {
        expect(screen.getByRole('checkbox', { name: /system audio/i })).toBeInTheDocument()
        expect(screen.getByRole('checkbox', { name: /microphone/i })).toBeInTheDocument()
        expect(screen.getByRole('checkbox', { name: /webcam/i })).toBeInTheDocument()
      })
    })
  })

  describe('checkbox toggleability', () => {
    it('system audio checkbox is independently toggleable', async () => {
      render(
        <RecordingSettingsModal
          open={true}
          onClose={mockOnClose}
          onStartRecording={mockOnStartRecording}
        />,
      )

      const systemAudioCheckbox = screen.getByRole('checkbox', { name: /system audio/i })
      expect(systemAudioCheckbox).not.toBeChecked()

      fireEvent.click(systemAudioCheckbox)
      expect(systemAudioCheckbox).toBeChecked()

      fireEvent.click(systemAudioCheckbox)
      expect(systemAudioCheckbox).not.toBeChecked()
    })

    it('microphone checkbox is independently toggleable', async () => {
      render(
        <RecordingSettingsModal
          open={true}
          onClose={mockOnClose}
          onStartRecording={mockOnStartRecording}
        />,
      )

      const microphoneCheckbox = screen.getByRole('checkbox', { name: /microphone/i })
      expect(microphoneCheckbox).not.toBeChecked()

      fireEvent.click(microphoneCheckbox)
      expect(microphoneCheckbox).toBeChecked()
    })

    it('webcam checkbox is independently toggleable', async () => {
      render(
        <RecordingSettingsModal
          open={true}
          onClose={mockOnClose}
          onStartRecording={mockOnStartRecording}
        />,
      )

      const webcamCheckbox = screen.getByRole('checkbox', { name: /webcam/i })
      expect(webcamCheckbox).not.toBeChecked()

      fireEvent.click(webcamCheckbox)
      expect(webcamCheckbox).toBeChecked()
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

      // Toggle on system audio and microphone
      fireEvent.click(screen.getByRole('checkbox', { name: /system audio/i }))
      fireEvent.click(screen.getByRole('checkbox', { name: /microphone/i }))

      // Click start
      fireEvent.click(screen.getByRole('button', { name: /start recording/i }))

      expect(mockOnStartRecording).toHaveBeenCalledWith({
        includeSystemAudio: true,
        includeMicrophone: true,
        includeWebcam: false,
        autoUpload: true,
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

  describe('auto-upload toggle', () => {
    it('renders auto-upload checkbox with label "Auto-upload after recording"', () => {
      render(
        <RecordingSettingsModal
          open={true}
          onClose={mockOnClose}
          onStartRecording={mockOnStartRecording}
        />,
      )

      expect(
        screen.getByRole('checkbox', { name: /auto-upload after recording/i }),
      ).toBeInTheDocument()
    })

    it('auto-upload checkbox is checked by default', () => {
      render(
        <RecordingSettingsModal
          open={true}
          onClose={mockOnClose}
          onStartRecording={mockOnStartRecording}
        />,
      )

      expect(screen.getByRole('checkbox', { name: /auto-upload after recording/i })).toBeChecked()
    })

    it('auto-upload checkbox is unchecked when localStorage has false', () => {
      localStorage.setItem('just-recordings-auto-upload', 'false')

      render(
        <RecordingSettingsModal
          open={true}
          onClose={mockOnClose}
          onStartRecording={mockOnStartRecording}
        />,
      )

      expect(
        screen.getByRole('checkbox', { name: /auto-upload after recording/i }),
      ).not.toBeChecked()
    })

    it('auto-upload checkbox is toggleable', () => {
      render(
        <RecordingSettingsModal
          open={true}
          onClose={mockOnClose}
          onStartRecording={mockOnStartRecording}
        />,
      )

      const autoUploadCheckbox = screen.getByRole('checkbox', {
        name: /auto-upload after recording/i,
      })
      expect(autoUploadCheckbox).toBeChecked()

      fireEvent.click(autoUploadCheckbox)
      expect(autoUploadCheckbox).not.toBeChecked()

      fireEvent.click(autoUploadCheckbox)
      expect(autoUploadCheckbox).toBeChecked()
    })

    it('persists auto-upload setting to localStorage when toggled', () => {
      render(
        <RecordingSettingsModal
          open={true}
          onClose={mockOnClose}
          onStartRecording={mockOnStartRecording}
        />,
      )

      const autoUploadCheckbox = screen.getByRole('checkbox', {
        name: /auto-upload after recording/i,
      })

      // Toggle off
      fireEvent.click(autoUploadCheckbox)
      expect(localStorage.getItem('just-recordings-auto-upload')).toBe('false')

      // Toggle on
      fireEvent.click(autoUploadCheckbox)
      expect(localStorage.getItem('just-recordings-auto-upload')).toBe('true')
    })

    it('includes autoUpload in settings when starting recording with auto-upload enabled', () => {
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

    it('includes autoUpload: false in settings when auto-upload is disabled', () => {
      render(
        <RecordingSettingsModal
          open={true}
          onClose={mockOnClose}
          onStartRecording={mockOnStartRecording}
        />,
      )

      // Disable auto-upload
      fireEvent.click(screen.getByRole('checkbox', { name: /auto-upload after recording/i }))

      fireEvent.click(screen.getByRole('button', { name: /start recording/i }))

      expect(mockOnStartRecording).toHaveBeenCalledWith(
        expect.objectContaining({
          autoUpload: false,
        }),
      )
    })
  })
})
