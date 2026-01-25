import { Box, Typography } from '@mui/material'
import { useEffect, useRef, useState } from 'react'
import { countdownEnd, countdownStart, countdownTick } from '../utils/electron'

export interface CountdownOverlayProps {
  /** Starting countdown value in seconds */
  seconds: number
  /** Called when countdown reaches 0 */
  onComplete: () => void
}

/**
 * Visual countdown overlay that displays before recording starts.
 * Shows large centered numbers counting down from the provided seconds value.
 * Sends IPC messages to Electron main process for taskbar/dock progress display.
 */
export function CountdownOverlay({ seconds, onComplete }: CountdownOverlayProps) {
  const [count, setCount] = useState(seconds)
  const onCompleteRef = useRef(onComplete)
  const totalSecondsRef = useRef(seconds)

  // Keep the callback ref up to date
  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  // Send countdownStart when component mounts
  useEffect(() => {
    countdownStart({
      totalSeconds: totalSecondsRef.current,
      secondsRemaining: totalSecondsRef.current,
    })
  }, [])

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCount((prev) => {
        if (prev <= 1) {
          clearInterval(intervalId)
          countdownEnd()
          onCompleteRef.current()
          return 0
        }
        const newCount = prev - 1
        countdownTick({
          totalSeconds: totalSecondsRef.current,
          secondsRemaining: newCount,
        })
        return newCount
      })
    }, 1000)

    return () => {
      clearInterval(intervalId)
    }
  }, [])

  return (
    <Box
      data-testid="countdown-overlay"
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        zIndex: 9999,
      }}
    >
      <Typography
        variant="h1"
        sx={{
          fontSize: { xs: '8rem', sm: '12rem', md: '16rem' },
          fontWeight: 'bold',
          color: 'white',
          textShadow: '0 0 20px rgba(255, 255, 255, 0.5)',
        }}
      >
        {count}
      </Typography>
    </Box>
  )
}
