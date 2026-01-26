import { RecorderService } from '@just-recordings/recorder'
import type { Recording, RecorderState } from '@just-recordings/recorder'

// Initialize recorder service
const recorder = new RecorderService()

// DOM elements
const startBtn = document.getElementById('startBtn') as HTMLButtonElement
const stopBtn = document.getElementById('stopBtn') as HTMLButtonElement
const statusIndicator = document.getElementById('statusIndicator') as HTMLSpanElement
const statusText = document.getElementById('statusText') as HTMLSpanElement
const timerDisplay = document.getElementById('timer') as HTMLDivElement

// Timer interval
let timerInterval: number | null = null

// Store recording for download (Task 3 will use this)
let lastRecording: Recording | null = null

/**
 * Generate a timestamp string for filenames (e.g., "2026-01-26-143052")
 */
function generateTimestamp(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = (now.getMonth() + 1).toString().padStart(2, '0')
  const day = now.getDate().toString().padStart(2, '0')
  const hours = now.getHours().toString().padStart(2, '0')
  const minutes = now.getMinutes().toString().padStart(2, '0')
  const seconds = now.getSeconds().toString().padStart(2, '0')
  return `${year}-${month}-${day}-${hours}${minutes}${seconds}`
}

/**
 * Download a recording blob as a file
 */
function downloadRecording(recording: Recording): void {
  // Create object URL from blob
  const url = URL.createObjectURL(recording.blob)

  // Create temporary anchor element
  const a = document.createElement('a')
  a.href = url
  a.download = `recording-${generateTimestamp()}.webm`

  // Trigger download
  document.body.appendChild(a)
  a.click()

  // Cleanup
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * Format milliseconds as MM:SS
 */
function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

/**
 * Update the UI based on recorder state
 */
function updateUI(state: RecorderState): void {
  // Update status indicator
  statusIndicator.className = `status-indicator ${state}`

  // Update status text
  switch (state) {
    case 'idle':
      statusText.textContent = 'Ready to record'
      break
    case 'recording':
      statusText.textContent = 'Recording...'
      break
    case 'paused':
      statusText.textContent = 'Paused'
      break
  }

  // Update button states
  startBtn.disabled = state !== 'idle'
  stopBtn.disabled = state === 'idle'

  // Handle timer
  if (state === 'recording') {
    startTimer()
  } else if (state === 'idle') {
    stopTimer()
    timerDisplay.textContent = '00:00'
  }
}

/**
 * Start the elapsed time timer
 */
function startTimer(): void {
  if (timerInterval) return

  timerInterval = window.setInterval(() => {
    const elapsed = recorder.getElapsedTime()
    timerDisplay.textContent = formatTime(elapsed)
  }, 100)
}

/**
 * Stop the elapsed time timer
 */
function stopTimer(): void {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
}

/**
 * Handle start recording
 */
async function handleStart(): Promise<void> {
  try {
    // Acquire screen first (shows picker)
    const { stream } = await recorder.acquireScreen()

    // Start recording with the acquired stream
    await recorder.startScreenRecording({ screenStream: stream })
  } catch {
    // User cancelled or error occurred
    updateUI('idle')
  }
}

/**
 * Handle stop recording
 */
async function handleStop(): Promise<void> {
  const recording = await recorder.stopRecording()
  lastRecording = recording

  // Automatically download the recording
  if (recording.blob.size > 0) {
    downloadRecording(recording)
  }
}

// Subscribe to state changes
recorder.onStateChange(updateUI)

// Handle external stream end (e.g., user clicks Chrome's "Stop sharing" button)
recorder.onStreamEnded(async () => {
  // Auto-stop and save the recording
  await handleStop()
})

// Set up button handlers
startBtn.addEventListener('click', handleStart)
stopBtn.addEventListener('click', handleStop)

// Initialize UI
updateUI(recorder.getState())

// Export for Task 3
export { lastRecording }
