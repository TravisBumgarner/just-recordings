import { useEffect, useRef, useState } from 'react'
import { log } from '@just-recordings/shared'
import { FaMicrophone, FaVideo, FaVolumeUp } from 'react-icons/fa'
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
  Tooltip,
  Typography,
} from '@mui/material'
import type { RecordingSettings } from '../hooks/useRecordingFlow'
import { useAutoUploadSetting } from '../hooks/useAutoUploadSetting'
import { isElectronCheck } from '../utils/electron'

export interface RecordingSettingsModalProps {
  open: boolean
  onClose: () => void
  onStartRecording: (settings: RecordingSettings) => void
}

interface MediaDevice {
  deviceId: string
  label: string
}

const STORAGE_KEY = 'just-recordings-settings'

interface StoredSettings {
  includeSystemAudio: boolean
  includeMicrophone: boolean
  includeWebcam: boolean
  microphoneDeviceId?: string
  webcamDeviceId?: string
}

function loadStoredSettings(): StoredSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch {
    // Ignore parse errors
  }
  // Default all to true
  return {
    includeSystemAudio: true,
    includeMicrophone: true,
    includeWebcam: true,
  }
}

function saveSettings(settings: StoredSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch {
    // Ignore storage errors
  }
}

export function RecordingSettingsModal({
  open,
  onClose,
  onStartRecording,
}: RecordingSettingsModalProps) {
  // Load initial values from localStorage (defaults to true for all)
  const storedSettings = loadStoredSettings()
  const [includeSystemAudio, setIncludeSystemAudio] = useState(storedSettings.includeSystemAudio)
  const [includeMicrophone, setIncludeMicrophone] = useState(storedSettings.includeMicrophone)
  const [includeWebcam, setIncludeWebcam] = useState(storedSettings.includeWebcam)
  const [microphoneDeviceId, setMicrophoneDeviceId] = useState(storedSettings.microphoneDeviceId || '')
  const [webcamDeviceId, setWebcamDeviceId] = useState(storedSettings.webcamDeviceId || '')
  const [microphoneDevices, setMicrophoneDevices] = useState<MediaDevice[]>([])
  const [webcamDevices, setWebcamDevices] = useState<MediaDevice[]>([])
  const [audioLevel, setAudioLevel] = useState(0)
  const { autoUploadEnabled } = useAutoUploadSetting()

  const isDesktop = isElectronCheck()

  // Save settings to localStorage whenever they change
  useEffect(() => {
    saveSettings({
      includeSystemAudio,
      includeMicrophone,
      includeWebcam,
      microphoneDeviceId: microphoneDeviceId || undefined,
      webcamDeviceId: webcamDeviceId || undefined,
    })
  }, [includeSystemAudio, includeMicrophone, includeWebcam, microphoneDeviceId, webcamDeviceId])

  // Refs for media streams
  const webcamStreamRef = useRef<MediaStream | null>(null)
  const micStreamRef = useRef<MediaStream | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)

  // Enumerate devices when modal opens
  useEffect(() => {
    if (!open) return

    const enumerateDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices()
        const mics = devices
          .filter((d) => d.kind === 'audioinput')
          .map((d) => ({ deviceId: d.deviceId, label: d.label || `Microphone ${d.deviceId.slice(0, 8)}` }))
        const cams = devices
          .filter((d) => d.kind === 'videoinput')
          .map((d) => ({ deviceId: d.deviceId, label: d.label || `Webcam ${d.deviceId.slice(0, 8)}` }))

        setMicrophoneDevices(mics)
        setWebcamDevices(cams)

        // Set default device if not already set
        if (mics.length > 0 && !microphoneDeviceId) {
          setMicrophoneDeviceId(mics[0].deviceId)
        }
        if (cams.length > 0 && !webcamDeviceId) {
          setWebcamDeviceId(cams[0].deviceId)
        }
      } catch (error) {
        log.error(error instanceof Error ? error : String(error), {
          context: 'Failed to enumerate devices',
        })
      }
    }

    enumerateDevices()
  }, [open, microphoneDeviceId, webcamDeviceId])

  // Start/stop webcam preview (desktop only)
  useEffect(() => {
    if (!open || !isDesktop || !includeWebcam) {
      // Clean up webcam stream
      if (webcamStreamRef.current) {
        webcamStreamRef.current.getTracks().forEach((track) => track.stop())
        webcamStreamRef.current = null
      }
      return
    }

    const startWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: webcamDeviceId ? { deviceId: { exact: webcamDeviceId } } : true,
        })
        webcamStreamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
      } catch (error) {
        log.error(error instanceof Error ? error : String(error), {
          context: 'Failed to start webcam',
        })
      }
    }

    startWebcam()

    return () => {
      if (webcamStreamRef.current) {
        webcamStreamRef.current.getTracks().forEach((track) => track.stop())
        webcamStreamRef.current = null
      }
    }
  }, [open, isDesktop, includeWebcam, webcamDeviceId])

  // Start/stop audio level meter (desktop only)
  useEffect(() => {
    if (!open || !isDesktop || !includeMicrophone) {
      // Clean up audio context and stream
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
        audioContextRef.current = null
      }
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach((track) => track.stop())
        micStreamRef.current = null
      }
      setAudioLevel(0)
      return
    }

    const startAudioMeter = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: microphoneDeviceId ? { deviceId: { exact: microphoneDeviceId } } : true,
        })
        micStreamRef.current = stream

        const audioContext = new AudioContext()
        audioContextRef.current = audioContext

        const analyser = audioContext.createAnalyser()
        analyser.fftSize = 256
        analyserRef.current = analyser

        const source = audioContext.createMediaStreamSource(stream)
        source.connect(analyser)

        const dataArray = new Uint8Array(analyser.frequencyBinCount)

        const updateLevel = () => {
          if (!analyserRef.current) return

          analyserRef.current.getByteFrequencyData(dataArray)
          const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length
          setAudioLevel(Math.min(100, (average / 128) * 100))

          animationFrameRef.current = requestAnimationFrame(updateLevel)
        }

        updateLevel()
      } catch (error) {
        log.error(error instanceof Error ? error : String(error), {
          context: 'Failed to start audio meter',
        })
      }
    }

    startAudioMeter()

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
        audioContextRef.current = null
      }
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach((track) => track.stop())
        micStreamRef.current = null
      }
    }
  }, [open, isDesktop, includeMicrophone, microphoneDeviceId])

  // Clean up all streams when modal closes
  useEffect(() => {
    if (!open) {
      if (webcamStreamRef.current) {
        webcamStreamRef.current.getTracks().forEach((track) => track.stop())
        webcamStreamRef.current = null
      }
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach((track) => track.stop())
        micStreamRef.current = null
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
        audioContextRef.current = null
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
    }
  }, [open])

  // Clean up streams when window becomes hidden (desktop app window closed/hidden)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Window is now hidden - release all preview streams
        if (webcamStreamRef.current) {
          webcamStreamRef.current.getTracks().forEach((track) => track.stop())
          webcamStreamRef.current = null
        }
        if (micStreamRef.current) {
          micStreamRef.current.getTracks().forEach((track) => track.stop())
          micStreamRef.current = null
        }
        if (audioContextRef.current) {
          audioContextRef.current.close()
          audioContextRef.current = null
        }
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current)
          animationFrameRef.current = null
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  const handleStartRecording = () => {
    // Clean up preview streams before starting recording
    if (webcamStreamRef.current) {
      webcamStreamRef.current.getTracks().forEach((track) => track.stop())
      webcamStreamRef.current = null
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop())
      micStreamRef.current = null
    }
    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }

    onStartRecording({
      includeSystemAudio,
      includeMicrophone,
      includeWebcam,
      autoUpload: autoUploadEnabled,
      microphoneDeviceId: includeMicrophone ? microphoneDeviceId : undefined,
      webcamDeviceId: includeWebcam ? webcamDeviceId : undefined,
    })
  }

  const modalContent = (
    <Box data-testid="recording-settings-modal">
      {/* Icon Button Row */}
      <Box sx={{ display: 'flex', gap: 2, my: 3, justifyContent: 'center' }}>
        <Tooltip title="Include system audio">
          <IconButton
            data-testid="system-audio-toggle"
            onClick={() => setIncludeSystemAudio(!includeSystemAudio)}
            aria-pressed={includeSystemAudio}
            sx={{
              bgcolor: includeSystemAudio ? 'primary.main' : 'grey.300',
              color: includeSystemAudio ? 'white' : 'grey.700',
              '&:hover': {
                bgcolor: includeSystemAudio ? 'primary.dark' : 'grey.400',
              },
              width: 56,
              height: 56,
            }}
          >
            <FaVolumeUp size={24} />
          </IconButton>
        </Tooltip>

        <Tooltip title="Include microphone">
          <IconButton
            data-testid="microphone-toggle"
            onClick={() => setIncludeMicrophone(!includeMicrophone)}
            aria-pressed={includeMicrophone}
            sx={{
              bgcolor: includeMicrophone ? 'primary.main' : 'grey.300',
              color: includeMicrophone ? 'white' : 'grey.700',
              '&:hover': {
                bgcolor: includeMicrophone ? 'primary.dark' : 'grey.400',
              },
              width: 56,
              height: 56,
            }}
          >
            <FaMicrophone size={24} />
          </IconButton>
        </Tooltip>

        <Tooltip title="Include webcam">
          <IconButton
            data-testid="webcam-toggle"
            onClick={() => setIncludeWebcam(!includeWebcam)}
            aria-pressed={includeWebcam}
            sx={{
              bgcolor: includeWebcam ? 'primary.main' : 'grey.300',
              color: includeWebcam ? 'white' : 'grey.700',
              '&:hover': {
                bgcolor: includeWebcam ? 'primary.dark' : 'grey.400',
              },
              width: 56,
              height: 56,
            }}
          >
            <FaVideo size={24} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Microphone Device Selection */}
      {includeMicrophone && microphoneDevices.length > 0 && (
        <Box sx={{ my: 2 }}>
          <FormControl fullWidth size="small" data-testid="microphone-device-select">
            <InputLabel>Microphone</InputLabel>
            <Select
              value={microphoneDeviceId}
              label="Microphone"
              onChange={(e) => setMicrophoneDeviceId(e.target.value)}
            >
              {microphoneDevices.map((device) => (
                <MenuItem key={device.deviceId} value={device.deviceId}>
                  {device.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Audio Level Meter (Desktop only) */}
          {isDesktop && (
            <Box sx={{ mt: 1 }} data-testid="audio-level-meter">
              <Typography variant="caption" color="text.secondary">
                Audio Level
              </Typography>
              <LinearProgress
                variant="determinate"
                value={audioLevel}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  bgcolor: 'grey.200',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: audioLevel > 80 ? 'error.main' : audioLevel > 50 ? 'warning.main' : 'success.main',
                  },
                }}
              />
            </Box>
          )}
        </Box>
      )}

      {/* Webcam Device Selection */}
      {includeWebcam && webcamDevices.length > 0 && (
        <Box sx={{ my: 2 }}>
          <FormControl fullWidth size="small" data-testid="webcam-device-select">
            <InputLabel>Webcam</InputLabel>
            <Select
              value={webcamDeviceId}
              label="Webcam"
              onChange={(e) => setWebcamDeviceId(e.target.value)}
            >
              {webcamDevices.map((device) => (
                <MenuItem key={device.deviceId} value={device.deviceId}>
                  {device.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Webcam Preview (Desktop only) */}
          {isDesktop && (
            <Box
              sx={{
                mt: 1,
                borderRadius: 1,
                overflow: 'hidden',
                bgcolor: 'black',
              }}
              data-testid="webcam-preview"
            >
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                style={{
                  width: '100%',
                  maxHeight: 200,
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            </Box>
          )}
        </Box>
      )}

      <Box sx={{ display: 'flex', gap: 1, mt: 2, justifyContent: 'flex-end' }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleStartRecording}>
          Start Recording
        </Button>
      </Box>
    </Box>
  )

  // On desktop, render inline (app window is already modal-like)
  // On web, wrap in a Dialog for proper modal experience
  if (isDesktop) {
    if (!open) return null
    return modalContent
  }

  // Web: use MUI Dialog
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 },
      }}
    >
      <DialogTitle>Recording Settings</DialogTitle>
      <DialogContent>{modalContent}</DialogContent>
    </Dialog>
  )
}
