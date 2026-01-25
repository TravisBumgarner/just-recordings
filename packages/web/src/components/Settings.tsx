import { Box, FormControlLabel, Switch, Typography } from '@mui/material'
import { useAutoUploadSetting } from '../hooks/useAutoUploadSetting'

export interface SettingsProps {
  /** Optional callback when settings are closed */
  onClose?: () => void
}

/**
 * Settings component for configuring app preferences.
 * Currently includes auto-upload toggle.
 */
export function Settings({ onClose }: SettingsProps) {
  const { autoUploadEnabled, setAutoUploadEnabled } = useAutoUploadSetting()

  return (
    <Box data-testid="settings" sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Settings
      </Typography>

      <Box sx={{ mb: 2 }}>
        <FormControlLabel
          control={
            <Switch
              checked={autoUploadEnabled}
              onChange={(e) => setAutoUploadEnabled(e.target.checked)}
              data-testid="auto-upload-toggle"
            />
          }
          label="Auto-upload after recording"
        />
        <Typography variant="body2" color="text.secondary" sx={{ ml: 4.5 }}>
          When enabled, recordings are automatically uploaded after they complete.
        </Typography>
      </Box>

      {onClose && (
        <Box sx={{ mt: 3 }}>
          <Typography
            component="button"
            onClick={onClose}
            sx={{
              background: 'none',
              border: 'none',
              color: 'primary.main',
              cursor: 'pointer',
              textDecoration: 'underline',
              p: 0,
            }}
          >
            Back
          </Typography>
        </Box>
      )}
    </Box>
  )
}
