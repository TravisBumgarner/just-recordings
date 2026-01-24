import { Box, Button, Typography } from '@mui/material'

export interface SetupWizardProps {
  isSetupComplete: boolean
  onComplete: () => void
  markSetupComplete: () => void
}

export function SetupWizard({
  isSetupComplete,
  onComplete,
  markSetupComplete,
}: SetupWizardProps) {
  // Stub implementation
  if (isSetupComplete) {
    return null
  }

  return null
}
