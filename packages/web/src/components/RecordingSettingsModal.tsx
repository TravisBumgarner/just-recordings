import { useEffect, useState } from 'react'
import { Box, Button, Checkbox, FormControlLabel, Typography } from '@mui/material'
import type { RecordingOptions, PermissionStatus } from '@just-recordings/recorder'
import { PermissionService } from '@just-recordings/recorder'
import { PermissionStatusBadge } from './PermissionStatusBadge'
import { PermissionDeniedMessage } from './PermissionDeniedMessage'

export interface RecordingSettingsModalProps {
  open: boolean
  onClose: () => void
  onStartRecording: (options: RecordingOptions) => void
}

const defaultPermissionStatus: PermissionStatus = {
  granted: false,
  state: 'prompt',
  canRequest: true,
}

export function RecordingSettingsModal({
  open,
  onClose,
  onStartRecording,
}: RecordingSettingsModalProps) {
  const [microphoneEnabled, setMicrophoneEnabled] = useState(false)
  const [cameraEnabled, setCameraEnabled] = useState(false)
  const [microphonePermission, setMicrophonePermission] =
    useState<PermissionStatus>(defaultPermissionStatus)
  const [cameraPermission, setCameraPermission] =
    useState<PermissionStatus>(defaultPermissionStatus)

  useEffect(() => {
    if (!open) return

    const permissionService = new PermissionService()

    const checkPermissions = async () => {
      const [micStatus, cameraStatus] = await Promise.all([
        permissionService.checkMicrophone(),
        permissionService.checkCamera(),
      ])
      setMicrophonePermission(micStatus)
      setCameraPermission(cameraStatus)
    }

    checkPermissions()
  }, [open])

  if (!open) return null

  const handleStartRecording = () => {
    onStartRecording({
      microphone: microphoneEnabled,
      camera: cameraEnabled,
    })
  }

  const showMicrophoneDeniedMessage =
    microphoneEnabled && microphonePermission.state === 'denied'
  const showCameraDeniedMessage =
    cameraEnabled && cameraPermission.state === 'denied'

  return (
    <Box data-testid="recording-settings-modal">
      <Typography variant="h6">Recording Settings</Typography>

      <Box sx={{ my: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={microphoneEnabled}
                onChange={(e) => setMicrophoneEnabled(e.target.checked)}
              />
            }
            label="Include microphone"
          />
          <Box data-testid="microphone-permission-badge">
            <PermissionStatusBadge
              status={microphonePermission}
              label=""
            />
          </Box>
        </Box>
        {showMicrophoneDeniedMessage && (
          <Box data-testid="microphone-denied-message" sx={{ ml: 4, mt: 1 }}>
            <PermissionDeniedMessage permission="microphone" />
          </Box>
        )}
      </Box>

      <Box sx={{ my: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={cameraEnabled}
                onChange={(e) => setCameraEnabled(e.target.checked)}
              />
            }
            label="Include camera"
          />
          <Box data-testid="camera-permission-badge">
            <PermissionStatusBadge
              status={cameraPermission}
              label=""
            />
          </Box>
        </Box>
        {showCameraDeniedMessage && (
          <Box data-testid="camera-denied-message" sx={{ ml: 4, mt: 1 }}>
            <PermissionDeniedMessage permission="camera" />
          </Box>
        )}
      </Box>

      <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleStartRecording}>
          Start Recording
        </Button>
      </Box>
    </Box>
  )
}
