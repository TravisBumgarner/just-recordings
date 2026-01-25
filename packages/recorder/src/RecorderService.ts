import { RecorderDatabase } from './db'
import type { AcquiredScreen, AcquireScreenOptions, RecorderState, Recording, RecordingOptions } from './types'

const DEFAULT_MIME_TYPE = 'video/webm'
const TIMESLICE_MS = 1000

export class RecorderService {
  private state: RecorderState = 'idle'
  private listeners: Set<(state: RecorderState) => void> = new Set()
  private mediaRecorder: MediaRecorder | null = null
  private mediaStream: MediaStream | null = null
  private microphoneStream: MediaStream | null = null
  private chunks: Blob[] = []
  private startTime: number = 0
  private pausedTime: number = 0
  private totalPausedDuration: number = 0
  private mimeType: string = DEFAULT_MIME_TYPE
  private db: RecorderDatabase

  constructor(db?: RecorderDatabase) {
    this.db = db || new RecorderDatabase()
  }

  getState(): RecorderState {
    return this.state
  }

  onStateChange(callback: (state: RecorderState) => void): () => void {
    this.listeners.add(callback)
    return () => {
      this.listeners.delete(callback)
    }
  }

  private setState(newState: RecorderState): void {
    this.state = newState
    this.listeners.forEach((callback) => callback(newState))
  }

  /**
   * Acquire a screen stream without starting recording.
   * Use this to show screen picker before countdown.
   * Returns the stream and a release function to clean up if recording is cancelled.
   */
  async acquireScreen(options?: AcquireScreenOptions): Promise<AcquiredScreen> {
    const includeSystemAudio = options?.includeSystemAudio ?? false
    let stream: MediaStream

    try {
      stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: includeSystemAudio,
      })
    } catch {
      // If system audio request fails, retry without audio
      if (includeSystemAudio) {
        stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: false,
        })
      } else {
        throw new Error('Failed to get display media')
      }
    }

    return {
      stream,
      release: () => {
        stream.getTracks().forEach((track) => track.stop())
      },
    }
  }

  async startScreenRecording(options?: RecordingOptions): Promise<void> {
    // Determine mime type
    this.mimeType = options?.mimeType || DEFAULT_MIME_TYPE
    if (!MediaRecorder.isTypeSupported(this.mimeType)) {
      this.mimeType = DEFAULT_MIME_TYPE
    }

    // Use pre-acquired screen stream or get a new one
    if (options?.screenStream) {
      this.mediaStream = options.screenStream
    } else {
      // Get display media stream with optional system audio (backward compatibility)
      const includeSystemAudio = options?.includeSystemAudio ?? false
      try {
        this.mediaStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: includeSystemAudio,
        })
      } catch {
        // If system audio request fails, retry without audio
        if (includeSystemAudio) {
          this.mediaStream = await navigator.mediaDevices.getDisplayMedia({
            video: true,
            audio: false,
          })
        } else {
          throw new Error('Failed to get display media')
        }
      }
    }

    // Get microphone stream if requested
    if (options?.includeMicrophone) {
      try {
        this.microphoneStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        })
      } catch {
        // Permission denied or no microphone - continue without mic
        this.microphoneStream = null
      }
    }

    // Reset chunks
    this.chunks = []

    // Create MediaRecorder
    const recorderOptions: MediaRecorderOptions = {
      mimeType: this.mimeType,
    }
    if (options?.videoBitsPerSecond) {
      recorderOptions.videoBitsPerSecond = options.videoBitsPerSecond
    }
    if (options?.audioBitsPerSecond) {
      recorderOptions.audioBitsPerSecond = options.audioBitsPerSecond
    }

    this.mediaRecorder = new MediaRecorder(this.mediaStream, recorderOptions)

    // Collect chunks
    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.chunks.push(event.data)
      }
    }

    // Reset time tracking
    this.totalPausedDuration = 0
    this.pausedTime = 0

    // Start recording with timeslice for periodic data
    this.mediaRecorder.start(TIMESLICE_MS)
    this.startTime = Date.now()
    this.setState('recording')
  }

  async stopRecording(): Promise<Recording> {
    return new Promise((resolve) => {
      if (!this.mediaRecorder || !this.mediaStream) {
        resolve({
          name: '',
          blob: new Blob(),
          mimeType: '',
          duration: 0,
          createdAt: new Date(),
          fileSize: 0,
          uploadStatus: 'pending',
        })
        return
      }

      this.mediaRecorder.onstop = () => {
        const duration = Date.now() - this.startTime
        const blob = new Blob(this.chunks, { type: this.mimeType })

        // Stop all tracks from all streams
        this.mediaStream?.getTracks().forEach((track) => track.stop())
        this.microphoneStream?.getTracks().forEach((track) => track.stop())

        // Create recording object
        const recording: Recording = {
          name: `Recording ${new Date().toISOString()}`,
          blob,
          mimeType: this.mimeType,
          duration,
          createdAt: new Date(),
          fileSize: blob.size,
          uploadStatus: 'pending',
        }

        // Cleanup
        this.mediaRecorder = null
        this.mediaStream = null
        this.microphoneStream = null
        this.chunks = []
        this.startTime = 0
        this.pausedTime = 0
        this.totalPausedDuration = 0

        this.setState('idle')
        resolve(recording)
      }

      this.mediaRecorder.stop()
    })
  }

  pauseRecording(): void {
    if (this.mediaRecorder && this.state === 'recording') {
      this.mediaRecorder.pause()
      this.pausedTime = Date.now()
      this.setState('paused')
    }
  }

  resumeRecording(): void {
    if (this.mediaRecorder && this.state === 'paused') {
      this.mediaRecorder.resume()
      // Add the duration we were paused to the total
      this.totalPausedDuration += Date.now() - this.pausedTime
      this.pausedTime = 0
      this.setState('recording')
    }
  }

  getElapsedTime(): number {
    if (this.state === 'idle' || this.startTime === 0) {
      return 0
    }

    const now = Date.now()

    if (this.state === 'paused') {
      // When paused, return time up to when we paused (minus any previous paused time)
      return this.pausedTime - this.startTime - this.totalPausedDuration
    }

    // When recording, return current elapsed time minus total paused duration
    return now - this.startTime - this.totalPausedDuration
  }

  cancelRecording(): void {
    // No-op if not recording or paused
    if (this.state === 'idle') {
      return
    }

    // Stop the MediaRecorder if it exists
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop()
    }

    // Stop all media tracks from all streams
    this.mediaStream?.getTracks().forEach((track) => track.stop())
    this.microphoneStream?.getTracks().forEach((track) => track.stop())

    // Cleanup without saving
    this.mediaRecorder = null
    this.mediaStream = null
    this.microphoneStream = null
    this.chunks = []
    this.startTime = 0
    this.pausedTime = 0
    this.totalPausedDuration = 0

    this.setState('idle')
  }

  // Storage operations
  async saveRecording(recording: Recording): Promise<number> {
    return await this.db.recordings.add(recording)
  }

  async getRecording(id: number): Promise<Recording | undefined> {
    return await this.db.recordings.get(id)
  }

  async getAllRecordings(): Promise<Recording[]> {
    return await this.db.recordings.orderBy('createdAt').reverse().toArray()
  }

  async deleteRecording(id: number): Promise<void> {
    await this.db.recordings.delete(id)
  }
}
