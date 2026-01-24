import { useEffect, useState } from 'react'
import { Box, Button, Typography } from '@mui/material'

export interface SetupWizardProps {
  isSetupComplete: boolean
  onComplete: () => void
  markSetupComplete: () => void
}

type WizardStep = 'welcome' | 'screenRecording' | 'complete'

export function SetupWizard({
  isSetupComplete,
  onComplete,
  markSetupComplete,
}: SetupWizardProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>('welcome')

  // Enable setup mode when wizard mounts (prevents window from hiding on blur)
  useEffect(() => {
    if (!isSetupComplete) {
      window.api?.setSetupMode(true)
    }
  }, [isSetupComplete])

  if (isSetupComplete) {
    return null
  }

  const handleNext = () => {
    if (currentStep === 'welcome') {
      setCurrentStep('screenRecording')
    } else if (currentStep === 'screenRecording') {
      setCurrentStep('complete')
    }
  }

  const handleOpenSystemPreferences = () => {
    window.api?.openSystemPreferences('screenRecording')
  }

  const handleFinish = () => {
    // Disable setup mode before completing (re-enables auto-hide on blur)
    window.api?.setSetupMode(false)
    markSetupComplete()
    onComplete()
  }

  return (
    <Box
      data-testid="setup-wizard"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 4,
        maxWidth: 480,
        mx: 'auto',
      }}
    >
      {currentStep === 'welcome' && (
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom>
            Welcome to Just Recordings
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Let's get you set up with the permissions needed to record your screen.
          </Typography>
          <Button variant="contained" onClick={handleNext}>
            Next
          </Button>
        </Box>
      )}

      {currentStep === 'screenRecording' && (
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom>
            Screen Recording Permission
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            To record your screen, you'll need to grant permission in System Preferences.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button variant="outlined" onClick={handleOpenSystemPreferences}>
              Open System Preferences
            </Button>
            <Button variant="contained" onClick={handleNext}>
              Next
            </Button>
          </Box>
        </Box>
      )}

      {currentStep === 'complete' && (
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom>
            All Set!
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            You can now start recording your screen. Click below to begin.
          </Typography>
          <Button variant="contained" onClick={handleFinish}>
            Get Started
          </Button>
        </Box>
      )}
    </Box>
  )
}
