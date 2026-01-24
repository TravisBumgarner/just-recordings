import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { PermissionService } from '../PermissionService'
import type { PermissionStatus } from '../PermissionService'

describe('PermissionService', () => {
  let service: PermissionService
  let mockPermissionsQuery: ReturnType<typeof vi.fn>
  let mockGetUserMedia: ReturnType<typeof vi.fn>

  beforeEach(() => {
    service = new PermissionService()

    mockPermissionsQuery = vi.fn()
    mockGetUserMedia = vi.fn()

    // @ts-expect-error - mocking navigator
    global.navigator = {
      permissions: {
        query: mockPermissionsQuery,
      },
      mediaDevices: {
        getUserMedia: mockGetUserMedia,
      },
    }
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('checkMicrophone', () => {
    it('returns granted status when permission is granted', async () => {
      mockPermissionsQuery.mockResolvedValue({ state: 'granted' })

      const status = await service.checkMicrophone()

      expect(status.state).toBe('granted')
      expect(status.granted).toBe(true)
    })

    it('returns denied status when permission is denied', async () => {
      mockPermissionsQuery.mockResolvedValue({ state: 'denied' })

      const status = await service.checkMicrophone()

      expect(status.state).toBe('denied')
      expect(status.granted).toBe(false)
    })

    it('returns prompt status when permission not yet requested', async () => {
      mockPermissionsQuery.mockResolvedValue({ state: 'prompt' })

      const status = await service.checkMicrophone()

      expect(status.state).toBe('prompt')
      expect(status.granted).toBe(false)
      expect(status.canRequest).toBe(true)
    })

    it('queries with microphone permission name', async () => {
      mockPermissionsQuery.mockResolvedValue({ state: 'granted' })

      await service.checkMicrophone()

      expect(mockPermissionsQuery).toHaveBeenCalledWith({ name: 'microphone' })
    })

    it('returns unsupported when Permissions API is not available', async () => {
      // @ts-expect-error - mocking navigator without permissions
      global.navigator = { mediaDevices: { getUserMedia: mockGetUserMedia } }

      const status = await service.checkMicrophone()

      expect(status.state).toBe('unsupported')
      expect(status.canRequest).toBe(true)
    })

    it('returns unsupported when Permissions API throws', async () => {
      mockPermissionsQuery.mockRejectedValue(new Error('Not supported'))

      const status = await service.checkMicrophone()

      expect(status.state).toBe('unsupported')
    })
  })

  describe('checkCamera', () => {
    it('returns granted status when permission is granted', async () => {
      mockPermissionsQuery.mockResolvedValue({ state: 'granted' })

      const status = await service.checkCamera()

      expect(status.state).toBe('granted')
      expect(status.granted).toBe(true)
    })

    it('returns denied status when permission is denied', async () => {
      mockPermissionsQuery.mockResolvedValue({ state: 'denied' })

      const status = await service.checkCamera()

      expect(status.state).toBe('denied')
      expect(status.granted).toBe(false)
    })

    it('queries with camera permission name', async () => {
      mockPermissionsQuery.mockResolvedValue({ state: 'granted' })

      await service.checkCamera()

      expect(mockPermissionsQuery).toHaveBeenCalledWith({ name: 'camera' })
    })
  })

  describe('checkScreenCapture', () => {
    it('returns unsupported state since screen capture cannot be pre-checked', async () => {
      const status = await service.checkScreenCapture()

      expect(status.state).toBe('unsupported')
      expect(status.granted).toBe(false)
      expect(status.canRequest).toBe(true)
    })
  })

  describe('requestMicrophone', () => {
    it('returns granted when getUserMedia succeeds', async () => {
      const mockStream = { getTracks: () => [{ stop: vi.fn() }] }
      mockGetUserMedia.mockResolvedValue(mockStream)

      const status = await service.requestMicrophone()

      expect(status.state).toBe('granted')
      expect(status.granted).toBe(true)
    })

    it('calls getUserMedia with audio: true', async () => {
      const mockStream = { getTracks: () => [{ stop: vi.fn() }] }
      mockGetUserMedia.mockResolvedValue(mockStream)

      await service.requestMicrophone()

      expect(mockGetUserMedia).toHaveBeenCalledWith({ audio: true })
    })

    it('returns denied when getUserMedia fails with NotAllowedError', async () => {
      mockGetUserMedia.mockRejectedValue(new DOMException('Permission denied', 'NotAllowedError'))

      const status = await service.requestMicrophone()

      expect(status.state).toBe('denied')
      expect(status.granted).toBe(false)
    })

    it('stops the stream after successful request', async () => {
      const mockStop = vi.fn()
      const mockStream = { getTracks: () => [{ stop: mockStop }] }
      mockGetUserMedia.mockResolvedValue(mockStream)

      await service.requestMicrophone()

      expect(mockStop).toHaveBeenCalled()
    })
  })

  describe('requestCamera', () => {
    it('returns granted when getUserMedia succeeds', async () => {
      const mockStream = { getTracks: () => [{ stop: vi.fn() }] }
      mockGetUserMedia.mockResolvedValue(mockStream)

      const status = await service.requestCamera()

      expect(status.state).toBe('granted')
      expect(status.granted).toBe(true)
    })

    it('calls getUserMedia with video: true', async () => {
      const mockStream = { getTracks: () => [{ stop: vi.fn() }] }
      mockGetUserMedia.mockResolvedValue(mockStream)

      await service.requestCamera()

      expect(mockGetUserMedia).toHaveBeenCalledWith({ video: true })
    })

    it('returns denied when getUserMedia fails with NotAllowedError', async () => {
      mockGetUserMedia.mockRejectedValue(new DOMException('Permission denied', 'NotAllowedError'))

      const status = await service.requestCamera()

      expect(status.state).toBe('denied')
      expect(status.granted).toBe(false)
    })
  })
})
