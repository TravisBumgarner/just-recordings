import { Alert, Button, Typography } from '@mui/material'

export interface PermissionDeniedMessageProps {
  permission: 'screen' | 'microphone' | 'camera'
  onDismiss?: () => void
}

type Browser = 'chrome' | 'firefox' | 'safari' | 'edge' | 'unknown'

function detectBrowser(): Browser {
  const userAgent = navigator.userAgent.toLowerCase()

  // Edge must be checked before Chrome (Edge includes "Chrome" in UA)
  if (userAgent.includes('edg/')) {
    return 'edge'
  }
  if (userAgent.includes('firefox')) {
    return 'firefox'
  }
  if (userAgent.includes('safari') && !userAgent.includes('chrome')) {
    return 'safari'
  }
  if (userAgent.includes('chrome')) {
    return 'chrome'
  }
  return 'unknown'
}

const permissionLabels: Record<PermissionDeniedMessageProps['permission'], string> = {
  screen: 'Screen recording',
  microphone: 'Microphone access',
  camera: 'Camera access',
}

const browserInstructions: Record<Browser, string> = {
  chrome: 'Click the lock icon in your address bar, then select "Site settings" to change permissions.',
  edge: 'Click the lock icon in your address bar, then select "Permissions for this site" to change settings.',
  firefox: 'Click the shield icon next to the address bar, then adjust permissions under "Permissions".',
  safari: 'Go to Safari menu > Settings for This Website, then change the permission to "Allow".',
  unknown: 'Please check your browser settings to enable this permission.',
}

export function PermissionDeniedMessage({
  permission,
  onDismiss,
}: PermissionDeniedMessageProps) {
  const browser = detectBrowser()
  const permissionLabel = permissionLabels[permission]
  const instructions = browserInstructions[browser]

  return (
    <Alert
      severity="warning"
      data-testid="permission-denied-message"
      action={
        onDismiss && (
          <Button color="inherit" size="small" onClick={onDismiss}>
            Dismiss
          </Button>
        )
      }
    >
      <Typography variant="body2" component="div">
        <strong>{permissionLabel}</strong> was denied.
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {instructions}
      </Typography>
    </Alert>
  )
}
