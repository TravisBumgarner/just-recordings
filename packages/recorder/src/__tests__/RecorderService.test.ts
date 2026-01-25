import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { RecorderDatabase } from '../db'
import { RecorderService } from '../RecorderService'
import type { Recording } from '../types'

// Mock MediaRecorder
class MockMediaRecorder {
  state: string = 'inactive'
  ondataavailable: ((event: { data: Blob }) => void) | null = null
  onstop: (() => void) | null = null
  onstart: (() => void) | null = null
  onpause: (() => void) | null = null
  onresume: (() => void) | null = null

  constructor(stream: MediaStream, _options?: MediaRecorderOptions) {
    this.stream = stream
  }

  start(timeslice?: number) {
    this.state = 'recording'
    this.onstart?.()
    // Simulate data available after a tick
    if (timeslice) {
      setTimeout(() => {
        this.ondataavailable?.({ data: new Blob(['chunk'], { type: 'video/webm' }) })
      }, 10)
    }
  }

  stop() {
    this.state = 'inactive'
    // Simulate final data chunk
    this.ondataavailable?.({ data: new Blob(['final'], { type: 'video/webm' }) })
    this.onstop?.()
  }

  pause() {
    this.state = 'paused'
    this.onpause?.()
  }

  resume() {
    this.state = 'recording'
    this.onresume?.()
  }

  static isTypeSupported(mimeType: string): boolean {
    return mimeType === 'video/webm'
  }
}

// Mock MediaStream
class MockMediaStream {
  getTracks() {
    return [{ stop: vi.fn(), addEventListener: vi.fn(), removeEventListener: vi.fn() }]
  }
  getVideoTracks() {
    return [{ stop: vi.fn(), readyState: 'live', addEventListener: vi.fn(), removeEventListener: vi.fn() }]
  }
}

describe('RecorderService', () => {
  let service: RecorderService
  let mockGetDisplayMedia: ReturnType<typeof vi.fn>
  let mockGetUserMedia: ReturnType<typeof vi.fn>

  beforeEach(() => {
    service = new RecorderService()

    // Mock getDisplayMedia
    mockGetDisplayMedia = vi.fn().mockResolvedValue(new MockMediaStream())
    // Mock getUserMedia
    mockGetUserMedia = vi.fn().mockResolvedValue(new MockMediaStream())

    // @ts-expect-error - mocking navigator
    global.navigator = {
      mediaDevices: {
        getDisplayMedia: mockGetDisplayMedia,
        getUserMedia: mockGetUserMedia,
      },
    }

    // @ts-expect-error - mocking MediaRecorder
    global.MediaRecorder = MockMediaRecorder as unknown as typeof MediaRecorder
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('getState', () => {
    it('returns idle initially', () => {
      expect(service.getState()).toBe('idle')
    })
  })

  describe('onStateChange', () => {
    it('returns an unsubscribe function', () => {
      const callback = vi.fn()
      const unsubscribe = service.onStateChange(callback)
      expect(typeof unsubscribe).toBe('function')
    })

    it('calls callback when state changes', async () => {
      const callback = vi.fn()
      service.onStateChange(callback)

      await service.startScreenRecording()

      expect(callback).toHaveBeenCalledWith('recording')
    })

    it('does not call callback after unsubscribe', async () => {
      const callback = vi.fn()
      const unsubscribe = service.onStateChange(callback)
      unsubscribe()

      await service.startScreenRecording()

      expect(callback).not.toHaveBeenCalled()
    })
  })

  describe('startScreenRecording', () => {
    it('calls getDisplayMedia', async () => {
      await service.startScreenRecording()
      expect(mockGetDisplayMedia).toHaveBeenCalled()
    })

    it('changes state to recording', async () => {
      await service.startScreenRecording()
      expect(service.getState()).toBe('recording')
    })

    it('passes video constraints to getDisplayMedia', async () => {
      await service.startScreenRecording()
      expect(mockGetDisplayMedia).toHaveBeenCalledWith(
        expect.objectContaining({
          video: true,
        }),
      )
    })
  })

  describe('stopRecording', () => {
    it('returns a Recording object', async () => {
      await service.startScreenRecording()
      const recording = await service.stopRecording()

      expect(recording).toHaveProperty('name')
      expect(recording).toHaveProperty('blob')
      expect(recording).toHaveProperty('mimeType')
      expect(recording).toHaveProperty('duration')
      expect(recording).toHaveProperty('createdAt')
      expect(recording).toHaveProperty('fileSize')
    })

    it('changes state to idle', async () => {
      await service.startScreenRecording()
      await service.stopRecording()
      expect(service.getState()).toBe('idle')
    })

    it('returns a blob with content', async () => {
      await service.startScreenRecording()
      const recording = await service.stopRecording()
      expect(recording.blob.size).toBeGreaterThan(0)
    })

    it('returns the correct mimeType', async () => {
      await service.startScreenRecording()
      const recording = await service.stopRecording()
      expect(recording.mimeType).toBe('video/webm')
    })
  })

  describe('pauseRecording', () => {
    it('changes state to paused', async () => {
      await service.startScreenRecording()
      service.pauseRecording()
      expect(service.getState()).toBe('paused')
    })
  })

  describe('resumeRecording', () => {
    it('changes state back to recording', async () => {
      await service.startScreenRecording()
      service.pauseRecording()
      service.resumeRecording()
      expect(service.getState()).toBe('recording')
    })
  })

  describe('getElapsedTime', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('returns 0 when not recording', () => {
      expect(service.getElapsedTime()).toBe(0)
    })

    it('returns elapsed time in milliseconds while recording', async () => {
      await service.startScreenRecording()

      vi.advanceTimersByTime(5000)

      expect(service.getElapsedTime()).toBe(5000)
    })

    it('stops counting when paused', async () => {
      await service.startScreenRecording()

      vi.advanceTimersByTime(3000)
      service.pauseRecording()
      vi.advanceTimersByTime(2000)

      expect(service.getElapsedTime()).toBe(3000)
    })

    it('resumes counting after pause', async () => {
      await service.startScreenRecording()

      vi.advanceTimersByTime(3000)
      service.pauseRecording()
      vi.advanceTimersByTime(2000)
      service.resumeRecording()
      vi.advanceTimersByTime(1000)

      expect(service.getElapsedTime()).toBe(4000)
    })

    it('returns 0 after recording stops', async () => {
      await service.startScreenRecording()
      vi.advanceTimersByTime(5000)
      await service.stopRecording()

      expect(service.getElapsedTime()).toBe(0)
    })

    it('returns 0 after recording is cancelled', async () => {
      await service.startScreenRecording()
      vi.advanceTimersByTime(5000)
      service.cancelRecording()

      expect(service.getElapsedTime()).toBe(0)
    })
  })

  describe('multi-source media stream composition', () => {
    it('requests system audio when includeSystemAudio is true', async () => {
      await service.startScreenRecording({ includeSystemAudio: true })

      expect(mockGetDisplayMedia).toHaveBeenCalledWith(
        expect.objectContaining({
          video: true,
          audio: true,
        }),
      )
    })

    it('does not request system audio when includeSystemAudio is false', async () => {
      await service.startScreenRecording({ includeSystemAudio: false })

      expect(mockGetDisplayMedia).toHaveBeenCalledWith(
        expect.objectContaining({
          video: true,
          audio: false,
        }),
      )
    })

    it('requests microphone when includeMicrophone is true', async () => {
      await service.startScreenRecording({ includeMicrophone: true })

      expect(mockGetUserMedia).toHaveBeenCalledWith(
        expect.objectContaining({
          audio: true,
        }),
      )
    })

    it('does not request microphone when includeMicrophone is false', async () => {
      await service.startScreenRecording({ includeMicrophone: false })

      expect(mockGetUserMedia).not.toHaveBeenCalled()
    })

    it('requests both system audio and microphone when both are enabled', async () => {
      await service.startScreenRecording({
        includeSystemAudio: true,
        includeMicrophone: true,
      })

      expect(mockGetDisplayMedia).toHaveBeenCalledWith(
        expect.objectContaining({
          video: true,
          audio: true,
        }),
      )
      expect(mockGetUserMedia).toHaveBeenCalledWith(
        expect.objectContaining({
          audio: true,
        }),
      )
    })

    it('captures video only when neither audio option is enabled', async () => {
      await service.startScreenRecording()

      expect(mockGetDisplayMedia).toHaveBeenCalledWith(
        expect.objectContaining({
          video: true,
          audio: false,
        }),
      )
      expect(mockGetUserMedia).not.toHaveBeenCalled()
    })

    it('stops all tracks from all streams on stop', async () => {
      const displayTrackStop = vi.fn()
      const micTrackStop = vi.fn()

      const mockDisplayStream = {
        getTracks: () => [{ stop: displayTrackStop, kind: 'video', addEventListener: vi.fn(), removeEventListener: vi.fn() }],
        getAudioTracks: () => [],
        getVideoTracks: () => [{ stop: displayTrackStop, kind: 'video', readyState: 'live', addEventListener: vi.fn(), removeEventListener: vi.fn() }],
      }
      const mockMicStream = {
        getTracks: () => [{ stop: micTrackStop, kind: 'audio' }],
        getAudioTracks: () => [{ stop: micTrackStop, kind: 'audio' }],
      }

      mockGetDisplayMedia.mockResolvedValue(mockDisplayStream)
      mockGetUserMedia.mockResolvedValue(mockMicStream)

      await service.startScreenRecording({ includeMicrophone: true })
      await service.stopRecording()

      expect(displayTrackStop).toHaveBeenCalled()
      expect(micTrackStop).toHaveBeenCalled()
    })

    it('stops all tracks from all streams on cancel', async () => {
      const displayTrackStop = vi.fn()
      const micTrackStop = vi.fn()

      const mockDisplayStream = {
        getTracks: () => [{ stop: displayTrackStop, kind: 'video', addEventListener: vi.fn(), removeEventListener: vi.fn() }],
        getAudioTracks: () => [],
        getVideoTracks: () => [{ stop: displayTrackStop, kind: 'video', readyState: 'live', addEventListener: vi.fn(), removeEventListener: vi.fn() }],
      }
      const mockMicStream = {
        getTracks: () => [{ stop: micTrackStop, kind: 'audio' }],
        getAudioTracks: () => [{ stop: micTrackStop, kind: 'audio' }],
      }

      mockGetDisplayMedia.mockResolvedValue(mockDisplayStream)
      mockGetUserMedia.mockResolvedValue(mockMicStream)

      await service.startScreenRecording({ includeMicrophone: true })
      service.cancelRecording()

      expect(displayTrackStop).toHaveBeenCalled()
      expect(micTrackStop).toHaveBeenCalled()
    })

    it('handles microphone permission denial gracefully', async () => {
      mockGetUserMedia.mockRejectedValue(new DOMException('Permission denied', 'NotAllowedError'))

      // Should not throw, should continue with just screen capture
      await expect(
        service.startScreenRecording({ includeMicrophone: true }),
      ).resolves.not.toThrow()

      expect(service.getState()).toBe('recording')
    })

    it('handles system audio permission denial gracefully', async () => {
      // getDisplayMedia rejects when audio permission denied in some browsers
      mockGetDisplayMedia.mockRejectedValueOnce(
        new DOMException('Permission denied', 'NotAllowedError'),
      )
      // Retry without audio should work
      mockGetDisplayMedia.mockResolvedValueOnce(new MockMediaStream())

      await expect(
        service.startScreenRecording({ includeSystemAudio: true }),
      ).resolves.not.toThrow()

      expect(service.getState()).toBe('recording')
    })
  })

  describe('acquireScreen', () => {
    it('returns a stream and release function', async () => {
      const result = await service.acquireScreen()

      expect(result).toHaveProperty('stream')
      expect(result).toHaveProperty('release')
      expect(typeof result.release).toBe('function')
    })

    it('calls getDisplayMedia', async () => {
      await service.acquireScreen()

      expect(mockGetDisplayMedia).toHaveBeenCalled()
    })

    it('requests system audio when includeSystemAudio is true', async () => {
      await service.acquireScreen({ includeSystemAudio: true })

      expect(mockGetDisplayMedia).toHaveBeenCalledWith(
        expect.objectContaining({
          video: true,
          audio: true,
        }),
      )
    })

    it('does not request system audio by default', async () => {
      await service.acquireScreen()

      expect(mockGetDisplayMedia).toHaveBeenCalledWith(
        expect.objectContaining({
          video: true,
          audio: false,
        }),
      )
    })

    it('release function stops all tracks', async () => {
      const mockTrackStop = vi.fn()
      const mockStream = {
        getTracks: () => [{ stop: mockTrackStop }, { stop: mockTrackStop }],
      }
      mockGetDisplayMedia.mockResolvedValue(mockStream)

      const result = await service.acquireScreen()
      result.release()

      expect(mockTrackStop).toHaveBeenCalledTimes(2)
    })

    it('throws error when user cancels screen picker', async () => {
      mockGetDisplayMedia.mockRejectedValue(new DOMException('Permission denied', 'NotAllowedError'))

      await expect(service.acquireScreen()).rejects.toThrow()
    })
  })

  describe('startScreenRecording with pre-acquired stream', () => {
    it('uses pre-acquired screen stream when provided', async () => {
      const preAcquiredStream = new MockMediaStream() as unknown as MediaStream
      await service.startScreenRecording({ screenStream: preAcquiredStream })

      // Should not call getDisplayMedia since stream was provided
      expect(mockGetDisplayMedia).not.toHaveBeenCalled()
      expect(service.getState()).toBe('recording')
    })

    it('still requests microphone when includeMicrophone is true with pre-acquired stream', async () => {
      const preAcquiredStream = new MockMediaStream() as unknown as MediaStream
      await service.startScreenRecording({
        screenStream: preAcquiredStream,
        includeMicrophone: true,
      })

      expect(mockGetDisplayMedia).not.toHaveBeenCalled()
      expect(mockGetUserMedia).toHaveBeenCalledWith(
        expect.objectContaining({
          audio: true,
        }),
      )
    })
  })

  describe('cancelRecording', () => {
    it('changes state to idle when recording', async () => {
      await service.startScreenRecording()
      expect(service.getState()).toBe('recording')

      service.cancelRecording()

      expect(service.getState()).toBe('idle')
    })

    it('changes state to idle when paused', async () => {
      await service.startScreenRecording()
      service.pauseRecording()
      expect(service.getState()).toBe('paused')

      service.cancelRecording()

      expect(service.getState()).toBe('idle')
    })

    it('is a no-op when idle', () => {
      expect(service.getState()).toBe('idle')

      service.cancelRecording()

      expect(service.getState()).toBe('idle')
    })

    it('stops all media tracks', async () => {
      const mockTrackStop = vi.fn()
      const mockStream = {
        getTracks: () => [{ stop: mockTrackStop, addEventListener: vi.fn(), removeEventListener: vi.fn() }, { stop: mockTrackStop, addEventListener: vi.fn(), removeEventListener: vi.fn() }],
        getVideoTracks: () => [{ stop: mockTrackStop, readyState: 'live', addEventListener: vi.fn(), removeEventListener: vi.fn() }],
      }
      mockGetDisplayMedia.mockResolvedValue(mockStream)

      await service.startScreenRecording()
      service.cancelRecording()

      expect(mockTrackStop).toHaveBeenCalledTimes(2)
    })

    it('notifies state change listeners', async () => {
      const callback = vi.fn()
      service.onStateChange(callback)

      await service.startScreenRecording()
      callback.mockClear() // Clear the 'recording' state change

      service.cancelRecording()

      expect(callback).toHaveBeenCalledWith('idle')
    })
  })
})

describe('RecorderService storage operations', () => {
  let service: RecorderService
  let db: RecorderDatabase

  const createTestRecording = (overrides?: Partial<Recording>): Recording => ({
    name: 'Test Recording',
    blob: new Blob(['test data'], { type: 'video/webm' }),
    mimeType: 'video/webm',
    duration: 5000,
    createdAt: new Date(),
    fileSize: 1024,
    ...overrides,
  })

  beforeEach(() => {
    db = new RecorderDatabase()
    service = new RecorderService(db)
  })

  afterEach(async () => {
    await db.delete()
  })

  describe('constructor', () => {
    it('accepts an optional database instance', () => {
      const customDb = new RecorderDatabase()
      const serviceWithDb = new RecorderService(customDb)
      expect(serviceWithDb).toBeInstanceOf(RecorderService)
    })

    it('creates a default database if none provided', () => {
      const serviceWithoutDb = new RecorderService()
      expect(serviceWithoutDb).toBeInstanceOf(RecorderService)
    })
  })

  describe('saveRecording', () => {
    it('stores the recording in the database', async () => {
      const recording = createTestRecording()
      const id = await service.saveRecording(recording)

      const saved = await db.recordings.get(id)
      expect(saved).toBeDefined()
      expect(saved?.name).toBe('Test Recording')
    })

    it('returns the id of the saved recording', async () => {
      const recording = createTestRecording()
      const id = await service.saveRecording(recording)

      expect(typeof id).toBe('number')
      expect(id).toBeGreaterThan(0)
    })
  })

  describe('getRecording', () => {
    it('retrieves a recording by id', async () => {
      const recording = createTestRecording({ name: 'Specific Recording' })
      const id = await db.recordings.add(recording)

      const retrieved = await service.getRecording(id)

      expect(retrieved).toBeDefined()
      expect(retrieved?.name).toBe('Specific Recording')
    })

    it('returns undefined for non-existent id', async () => {
      const retrieved = await service.getRecording(99999)
      expect(retrieved).toBeUndefined()
    })
  })

  describe('getAllRecordings', () => {
    it('returns all recordings', async () => {
      await db.recordings.add(createTestRecording({ name: 'Recording 1' }))
      await db.recordings.add(createTestRecording({ name: 'Recording 2' }))

      const recordings = await service.getAllRecordings()

      expect(recordings).toHaveLength(2)
    })

    it('returns recordings ordered by createdAt descending', async () => {
      const olderDate = new Date('2024-01-01')
      const newerDate = new Date('2024-01-02')

      await db.recordings.add(createTestRecording({ name: 'Older', createdAt: olderDate }))
      await db.recordings.add(createTestRecording({ name: 'Newer', createdAt: newerDate }))

      const recordings = await service.getAllRecordings()

      expect(recordings[0].name).toBe('Newer')
      expect(recordings[1].name).toBe('Older')
    })

    it('returns empty array when no recordings exist', async () => {
      const recordings = await service.getAllRecordings()
      expect(recordings).toEqual([])
    })
  })

  describe('deleteRecording', () => {
    it('removes the recording from the database', async () => {
      const recording = createTestRecording()
      const id = await db.recordings.add(recording)

      await service.deleteRecording(id)

      const deleted = await db.recordings.get(id)
      expect(deleted).toBeUndefined()
    })

    it('does not throw when deleting non-existent id', async () => {
      await expect(service.deleteRecording(99999)).resolves.not.toThrow()
    })
  })
})
