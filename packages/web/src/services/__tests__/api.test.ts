import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { checkHealth, getRecordings, getRecording, getVideoUrl, deleteRecording, ApiError } from '../api';

describe('API Service', () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    mockFetch.mockReset();
  });

  describe('checkHealth', () => {
    it('returns health status when API responds successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: 'ok' }),
      });

      const result = await checkHealth();
      expect(result).toEqual({ status: 'ok' });
    });

    it('calls the correct endpoint', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: 'ok' }),
      });

      await checkHealth();
      expect(mockFetch).toHaveBeenCalledWith('/api/health');
    });

    it('throws ApiError when response is not ok', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await expect(checkHealth()).rejects.toThrow(ApiError);
    });

    it('throws ApiError with status code when response fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 503,
      });

      await expect(checkHealth()).rejects.toMatchObject({
        statusCode: 503,
      });
    });

    it('throws ApiError when network fails', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(checkHealth()).rejects.toThrow(ApiError);
    });
  });

  describe('getRecordings', () => {
    it('calls GET /api/recordings', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ recordings: [] }),
      });

      await getRecordings();
      expect(mockFetch).toHaveBeenCalledWith('/api/recordings');
    });

    it('returns array of recordings from response', async () => {
      const mockRecordings = [
        { id: '1', name: 'Recording 1', mimeType: 'video/webm', duration: 60000, fileSize: 1024, createdAt: '2026-01-18T12:00:00Z', path: 'uploads/1.webm' },
      ];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ recordings: mockRecordings }),
      });

      const result = await getRecordings();
      expect(result).toEqual(mockRecordings);
    });

    it('throws ApiError when response is not ok', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await expect(getRecordings()).rejects.toThrow(ApiError);
    });
  });

  describe('getRecording', () => {
    it('calls GET /api/recordings/:id', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'test-id', name: 'Test' }),
      });

      await getRecording('test-id');
      expect(mockFetch).toHaveBeenCalledWith('/api/recordings/test-id');
    });

    it('returns recording metadata from response', async () => {
      const mockRecording = { id: 'test-id', name: 'Test Recording', mimeType: 'video/webm', duration: 60000, fileSize: 1024, createdAt: '2026-01-18T12:00:00Z', path: 'uploads/test.webm' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockRecording,
      });

      const result = await getRecording('test-id');
      expect(result).toEqual(mockRecording);
    });

    it('returns null when recording not found (404)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      const result = await getRecording('nonexistent');
      expect(result).toBeNull();
    });

    it('throws ApiError for other error status codes', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await expect(getRecording('test-id')).rejects.toThrow(ApiError);
    });
  });

  describe('getVideoUrl', () => {
    it('returns correct video URL for recording ID', () => {
      const url = getVideoUrl('test-id');
      expect(url).toBe('/api/recordings/test-id/video');
    });
  });

  describe('deleteRecording', () => {
    it('calls DELETE /api/recordings/:id', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      await deleteRecording('test-id');
      expect(mockFetch).toHaveBeenCalledWith('/api/recordings/test-id', {
        method: 'DELETE',
      });
    });

    it('throws ApiError when response is not ok', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await expect(deleteRecording('test-id')).rejects.toThrow(ApiError);
    });
  });
});
