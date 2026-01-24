import { Box, Button, Checkbox, FormControlLabel, Typography } from '@mui/material'
import type { RecordingOptions } from '@just-recordings/recorder'
import type { PermissionStatus } from '@just-recordings/recorder'

export interface RecordingSettingsModalProps {
  open: boolean
  onClose: () => void
  onStartRecording: (options: RecordingOptions) => void
}

export function RecordingSettingsModal({
  open,
  onClose,
  onStartRecording,
}: RecordingSettingsModalProps) {
  // Stub implementation
  if (!open) return null

  return (
    <Box data-testid="recording-settings-modal">
      <Typography variant="h6">Recording Settings</Typography>
      <FormControlLabel control={<Checkbox />} label="Include microphone" />
      <FormControlLabel control={<Checkbox />} label="Include camera" />
      <Button onClick={onClose}>Cancel</Button>
      <Button onClick={() => onStartRecording({})}>Start Recording</Button>
    </Box>
  )
}
