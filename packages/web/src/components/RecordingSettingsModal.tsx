import { useEffect, useRef, useState } from 'react'
import { FaMicrophone, FaVideo, FaVolumeUp } from 'react-icons/fa'
import {
  Box,
  Button,
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

export function RecordingSettingsModal({
  open,
  onClose,
  onStartRecording,
}: RecordingSettingsModalProps) {
  const [includeSystemAudio, setIncludeSystemAudio] = useState(false)
  const [includeMicrophone, setIncludeMicrophone] = useState(false)
  const [includeWebcam, setIncludeWebcam] = useState(false)
  const [microphoneDeviceId, setMicrophoneDeviceId] = useState('')
  const [webcamDeviceId, setWebcamDeviceId] = useState('')
  const [microphoneDevices, setMicrophoneDevices] = useState<MediaDevice[]>([])
  const [webcamDevices, setWebcamDevices] = useState<MediaDevice[]>([])
  const [audioLevel, setAudioLevel] = useState(0)
  const { autoUploadEnabled } = useAutoUploadSetting()

  const isDesktop = isElectronCheck()

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
        console.error('Failed to enumerate devices:', error)
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
        console.error('Failed to start webcam:', error)
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
        console.error('Failed to start audio meter:', error)
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

  if (!open) return null

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

  return (
    <Box data-testid="recording-settings-modal">
      <Typography variant="h6">Recording Settings</Typography>

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

      <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleStartRecording}>
          Start Recording
        </Button>
      </Box>
    </Box>
  )
}
