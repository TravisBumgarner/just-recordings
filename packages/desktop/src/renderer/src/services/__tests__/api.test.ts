import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError, checkHealth } from '../api'

describe('API Service', () => {
  const mockFetch = vi.fn()

  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    mockFetch.mockReset()
  })

  describe('checkHealth', () => {
    it('returns health status when API responds successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: 'ok' }),
      })

      const result = await checkHealth()
      expect(result).toEqual({ status: 'ok' })
    })

    it('calls the correct endpoint', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: 'ok' }),
      })

      await checkHealth()
      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3001/api/health')
    })

    it('throws ApiError when response is not ok', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      })

      await expect(checkHealth()).rejects.toThrow(ApiError)
    })

    it('throws ApiError with status code when response fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 503,
      })

      await expect(checkHealth()).rejects.toMatchObject({
        statusCode: 503,
      })
    })

    it('throws ApiError when network fails', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      await expect(checkHealth()).rejects.toThrow(ApiError)
    })
  })
})
