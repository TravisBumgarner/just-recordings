import { useEffect, useState } from 'react'
import { Box, Button, Typography } from '@mui/material'
import {
  PermissionTestResult,
  type PermissionTestState,
} from './PermissionTestResult'

export interface SetupWizardProps {
  isSetupComplete: boolean
  onComplete: () => void
  markSetupComplete: () => void
}

type WizardStep = 'welcome' | 'screenRecording' | 'microphone' | 'complete'

export function SetupWizard({
  isSetupComplete,
  onComplete,
  markSetupComplete,
}: SetupWizardProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>('welcome')
  const [screenRecordingTestState, setScreenRecordingTestState] =
    useState<PermissionTestState>('idle')
  const [microphoneTestState, setMicrophoneTestState] =
    useState<PermissionTestState>('idle')

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
      setCurrentStep('microphone')
    } else if (currentStep === 'microphone') {
      setCurrentStep('complete')
    }
  }

  const handleOpenSystemPreferences = () => {
    window.api?.openSystemPreferences('screenRecording')
  }

  const handleTestScreenRecording = async () => {
    setScreenRecordingTestState('testing')
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true })
      // Immediately stop all tracks - we just needed to verify permission works
      stream.getTracks().forEach((track) => track.stop())
      setScreenRecordingTestState('success')
    } catch {
      setScreenRecordingTestState('failed')
    }
  }

  const handleOpenMicrophonePreferences = () => {
    window.api?.openSystemPreferences('microphone')
  }

  const handleTestMicrophone = async () => {
    setMicrophoneTestState('testing')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      // Immediately stop all tracks - we just needed to verify permission works
      stream.getTracks().forEach((track) => track.stop())
      setMicrophoneTestState('success')
    } catch {
      setMicrophoneTestState('failed')
    }
  }

  const handleSkipMicrophone = () => {
    setCurrentStep('complete')
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
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button variant="outlined" onClick={handleOpenSystemPreferences}>
              Open System Preferences
            </Button>
            <Button variant="outlined" onClick={handleTestScreenRecording}>
              Test Screen Recording
            </Button>
            <Button variant="contained" onClick={handleNext}>
              Next
            </Button>
          </Box>
          <PermissionTestResult
            state={screenRecordingTestState}
            successMessage="Screen recording works!"
            failedMessage="Permission denied - please grant access in System Preferences"
          />
        </Box>
      )}

      {currentStep === 'microphone' && (
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom>
            Microphone Permission
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            To record audio with your screen, grant microphone access in System Preferences.
            This is optional - you can skip if you only want to record video.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button variant="outlined" onClick={handleOpenMicrophonePreferences}>
              Open System Preferences
            </Button>
            <Button variant="outlined" onClick={handleTestMicrophone}>
              Test Microphone
            </Button>
            <Button variant="text" onClick={handleSkipMicrophone}>
              Skip
            </Button>
            <Button variant="contained" onClick={handleNext}>
              Next
            </Button>
          </Box>
          <PermissionTestResult
            state={microphoneTestState}
            successMessage="Microphone works!"
            failedMessage="Permission denied - please grant access in System Preferences"
          />
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
