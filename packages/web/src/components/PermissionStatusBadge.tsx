import { Box, Typography } from '@mui/material'
import type { PermissionStatus } from '@just-recordings/recorder'

export interface PermissionStatusBadgeProps {
  status: PermissionStatus
  label: string
}

const stateConfig = {
  granted: {
    icon: '\u2713', // checkmark
    color: 'success.main',
  },
  denied: {
    icon: '\u2717', // X mark
    color: 'error.main',
  },
  prompt: {
    icon: '\u25CB', // circle outline
    color: 'text.secondary',
  },
  unsupported: {
    icon: '\u2014', // em dash
    color: 'text.disabled',
  },
} as const

export function PermissionStatusBadge({ status, label }: PermissionStatusBadgeProps) {
  const config = stateConfig[status.state]

  return (
    <Box
      component="span"
      data-testid="permission-badge"
      data-state={status.state}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.5,
        fontSize: '0.875rem',
      }}
    >
      <Typography
        component="span"
        sx={{ color: config.color, fontWeight: 'bold', fontSize: '1rem' }}
      >
        {config.icon}
      </Typography>
      {label}
    </Box>
  )
}
