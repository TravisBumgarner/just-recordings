import { Typography } from '@mui/material'
import { useEffect, useState } from 'react'

export interface RecordingTimerProps {
  /** Function that returns elapsed time in milliseconds */
  getElapsedTime: () => number
  /** Update interval in milliseconds (default: 100ms for smooth updates) */
  updateInterval?: number
}

/**
 * Formats milliseconds into MM:SS or HH:MM:SS format
 */
export function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  const pad = (n: number) => n.toString().padStart(2, '0')

  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
  }

  return `${pad(minutes)}:${pad(seconds)}`
}

/**
 * Component that displays elapsed recording time.
 * Polls getElapsedTime() and formats for display.
 */
export function RecordingTimer({ getElapsedTime, updateInterval = 100 }: RecordingTimerProps) {
  const [elapsed, setElapsed] = useState(() => getElapsedTime())

  useEffect(() => {
    const intervalId = setInterval(() => {
      setElapsed(getElapsedTime())
    }, updateInterval)

    return () => {
      clearInterval(intervalId)
    }
  }, [getElapsedTime, updateInterval])

  return (
    <Typography variant="h6" component="span" data-testid="recording-timer">
      {formatTime(elapsed)}
    </Typography>
  )
}
