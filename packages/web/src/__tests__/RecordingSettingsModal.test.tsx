import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
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

  describe('permission status badges', () => {
    it('shows permission status badge next to microphone option', async () => {
      render(
        <RecordingSettingsModal
          open={true}
          onClose={mockOnClose}
          onStartRecording={mockOnStartRecording}
        />,
      )

      await waitFor(() => {
        expect(screen.getByTestId('microphone-permission-badge')).toBeInTheDocument()
      })
    })

    it('shows permission status badge next to camera option', async () => {
      render(
        <RecordingSettingsModal
          open={true}
          onClose={mockOnClose}
          onStartRecording={mockOnStartRecording}
        />,
      )

      await waitFor(() => {
        expect(screen.getByTestId('camera-permission-badge')).toBeInTheDocument()
      })
    })
  })

  describe('permission checking on open', () => {
    it('checks microphone permission status when modal opens', async () => {
      render(
        <RecordingSettingsModal
          open={true}
          onClose={mockOnClose}
          onStartRecording={mockOnStartRecording}
        />,
      )

      await waitFor(() => {
        expect(mockPermissionService.checkMicrophone).toHaveBeenCalled()
      })
    })

    it('checks camera permission status when modal opens', async () => {
      render(
        <RecordingSettingsModal
          open={true}
          onClose={mockOnClose}
          onStartRecording={mockOnStartRecording}
        />,
      )

      await waitFor(() => {
        expect(mockPermissionService.checkCamera).toHaveBeenCalled()
      })
    })
  })

  describe('denied permission messages', () => {
    it('shows PermissionDeniedMessage when denied microphone permission is toggled on', async () => {
      mockPermissionService.checkMicrophone.mockResolvedValue({
        granted: false,
        state: 'denied',
        canRequest: false,
      })

      render(
        <RecordingSettingsModal
          open={true}
          onClose={mockOnClose}
          onStartRecording={mockOnStartRecording}
        />,
      )

      // Wait for permissions to load
      await waitFor(() => {
        expect(mockPermissionService.checkMicrophone).toHaveBeenCalled()
      })

      // Toggle on microphone
      const microphoneCheckbox = screen.getByRole('checkbox', { name: /microphone/i })
      fireEvent.click(microphoneCheckbox)

      await waitFor(() => {
        expect(screen.getByTestId('microphone-denied-message')).toBeInTheDocument()
      })
    })

    it('shows PermissionDeniedMessage when denied camera permission is toggled on', async () => {
      mockPermissionService.checkCamera.mockResolvedValue({
        granted: false,
        state: 'denied',
        canRequest: false,
      })

      render(
        <RecordingSettingsModal
          open={true}
          onClose={mockOnClose}
          onStartRecording={mockOnStartRecording}
        />,
      )

      // Wait for permissions to load
      await waitFor(() => {
        expect(mockPermissionService.checkCamera).toHaveBeenCalled()
      })

      // Toggle on camera
      const cameraCheckbox = screen.getByRole('checkbox', { name: /camera/i })
      fireEvent.click(cameraCheckbox)

      await waitFor(() => {
        expect(screen.getByTestId('camera-denied-message')).toBeInTheDocument()
      })
    })
  })

  describe('modal functionality', () => {
    it('remains functional - user can still attempt to start recording', async () => {
      mockPermissionService.checkMicrophone.mockResolvedValue({
        granted: false,
        state: 'denied',
        canRequest: false,
      })

      render(
        <RecordingSettingsModal
          open={true}
          onClose={mockOnClose}
          onStartRecording={mockOnStartRecording}
        />,
      )

      // Wait for permissions to load
      await waitFor(() => {
        expect(mockPermissionService.checkMicrophone).toHaveBeenCalled()
      })

      // Start recording button should be clickable
      const startButton = screen.getByRole('button', { name: /start recording/i })
      fireEvent.click(startButton)

      expect(mockOnStartRecording).toHaveBeenCalled()
    })

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
  })
})
