import { useState } from 'react'
import { Box, Button, Checkbox, FormControlLabel, Typography } from '@mui/material'
import type { RecordingOptions } from '@just-recordings/recorder'

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
  const [includeSystemAudio, setIncludeSystemAudio] = useState(false)
  const [includeMicrophone, setIncludeMicrophone] = useState(false)
  const [includeWebcam, setIncludeWebcam] = useState(false)

  if (!open) return null

  const handleStartRecording = () => {
    onStartRecording({
      includeSystemAudio,
      includeMicrophone,
      includeWebcam,
    })
  }

  return (
    <Box data-testid="recording-settings-modal">
      <Typography variant="h6">Recording Settings</Typography>

      <Box sx={{ my: 2 }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={includeSystemAudio}
              onChange={(e) => setIncludeSystemAudio(e.target.checked)}
            />
          }
          label="Include system audio"
        />
      </Box>

      <Box sx={{ my: 2 }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={includeMicrophone}
              onChange={(e) => setIncludeMicrophone(e.target.checked)}
            />
          }
          label="Include microphone"
        />
      </Box>

      <Box sx={{ my: 2 }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={includeWebcam}
              onChange={(e) => setIncludeWebcam(e.target.checked)}
            />
          }
          label="Include webcam"
        />
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
