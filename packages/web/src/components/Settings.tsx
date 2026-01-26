import { Box, Divider, FormControlLabel, Switch, Typography } from '@mui/material'
import { useAutoUploadSetting } from '../hooks/useAutoUploadSetting'
import { SPACING } from '../styles/styleConsts'

export interface SettingsProps {
  /** Optional callback when settings are closed */
  onClose?: () => void
}

/**
 * A section header component for organizing settings into groups.
 */
function SectionHeader({ title }: { title: string }) {
  return (
    <Typography
      variant="h3"
      sx={{
        mb: SPACING.SMALL.PX,
        mt: SPACING.MEDIUM.PX,
        '&:first-of-type': {
          mt: 0,
        },
      }}
    >
      {title}
    </Typography>
  )
}

/**
 * A setting row component for consistent layout of individual settings.
 */
function SettingRow({
  control,
  label,
  description,
}: {
  control: React.ReactNode
  label: string
  description?: string
}) {
  return (
    <Box sx={{ mb: SPACING.SMALL.PX }}>
      <FormControlLabel
        control={control}
        label={label}
        sx={{
          ml: 0,
          '& .MuiFormControlLabel-label': {
            fontWeight: 600,
          },
        }}
      />
      {description && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ ml: 6, mt: -0.5 }}
        >
          {description}
        </Typography>
      )}
    </Box>
  )
}

/**
 * Settings component for configuring app preferences.
 * Organized into logical sections with clear visual hierarchy.
 */
export function Settings({ onClose }: SettingsProps) {
  const { autoUploadEnabled, setAutoUploadEnabled } = useAutoUploadSetting()

  return (
    <Box data-testid="settings" sx={{ p: SPACING.MEDIUM.PX }}>
      {/* Page Title */}
      <Typography variant="h2" sx={{ mb: SPACING.MEDIUM.PX }}>
        Settings
      </Typography>

      <Divider sx={{ mb: SPACING.MEDIUM.PX }} />

      {/* Recording Section */}
      <SectionHeader title="Recording" />
      <SettingRow
        control={
          <Switch
            checked={autoUploadEnabled}
            onChange={(e) => setAutoUploadEnabled(e.target.checked)}
            data-testid="auto-upload-toggle"
          />
        }
        label="Upload while recording"
        description="When enabled, recordings are uploaded automatically as you record."
      />

      {/* Back Button */}
      {onClose && (
        <>
          <Divider sx={{ mt: SPACING.MEDIUM.PX, mb: SPACING.MEDIUM.PX }} />
          <Box>
            <Typography
              component="button"
              onClick={onClose}
              sx={{
                background: 'none',
                border: 'none',
                color: 'text.primary',
                cursor: 'pointer',
                textDecoration: 'underline',
                p: 0,
                fontWeight: 600,
                '&:hover': {
                  color: 'text.secondary',
                },
              }}
            >
              Back
            </Typography>
          </Box>
        </>
      )}
    </Box>
  )
}
