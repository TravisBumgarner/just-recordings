import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import fs from 'fs/promises';
import path from 'path';

const UPLOADS_DIR = 'uploads';
const METADATA_FILE = path.join(UPLOADS_DIR, 'metadata.json');

// Helper to create a test recording on disk
async function createTestRecording(id: string, metadata: {
  name: string;
  mimeType: string;
  duration: number;
  fileSize: number;
  createdAt: string;
}) {
  await fs.mkdir(UPLOADS_DIR, { recursive: true });

  // Write video file
  const videoPath = path.join(UPLOADS_DIR, `${id}.webm`);
  await fs.writeFile(videoPath, Buffer.from('fake video content'));

  // Read existing metadata or create new
  let allMetadata: Record<string, typeof metadata & { id: string; path: string }> = {};
  try {
    const existing = await fs.readFile(METADATA_FILE, 'utf-8');
    allMetadata = JSON.parse(existing);
  } catch {
    // File doesn't exist yet
  }

  // Add new recording metadata
  allMetadata[id] = {
    id,
    path: videoPath,
    ...metadata,
  };

  await fs.writeFile(METADATA_FILE, JSON.stringify(allMetadata, null, 2));

  return { id, videoPath, ...metadata };
}

// Helper to clean up test files
async function cleanupTestFiles() {
  try {
    await fs.rm(UPLOADS_DIR, { recursive: true, force: true });
  } catch {
    // Ignore errors
  }
}

describe('Recordings endpoints', () => {
  beforeEach(async () => {
    await cleanupTestFiles();
  });

  afterEach(async () => {
    await cleanupTestFiles();
  });

  describe('GET /api/recordings', () => {
    it('returns empty array when no recordings exist', async () => {
      const response = await request(app).get('/api/recordings');

      expect(response.status).toBe(200);
      expect(response.body.recordings).toEqual([]);
    });

    it('returns list of recordings with metadata', async () => {
      await createTestRecording('test-id-1', {
        name: 'Recording 1',
        mimeType: 'video/webm',
        duration: 60000,
        fileSize: 1024,
        createdAt: '2026-01-18T12:00:00Z',
      });

      const response = await request(app).get('/api/recordings');

      expect(response.status).toBe(200);
      expect(response.body.recordings).toHaveLength(1);
      expect(response.body.recordings[0]).toMatchObject({
        id: 'test-id-1',
        name: 'Recording 1',
        duration: 60000,
        fileSize: 1024,
      });
    });

    it('returns multiple recordings', async () => {
      await createTestRecording('id-1', {
        name: 'First',
        mimeType: 'video/webm',
        duration: 30000,
        fileSize: 512,
        createdAt: '2026-01-18T10:00:00Z',
      });
      await createTestRecording('id-2', {
        name: 'Second',
        mimeType: 'video/webm',
        duration: 45000,
        fileSize: 768,
        createdAt: '2026-01-18T11:00:00Z',
      });

      const response = await request(app).get('/api/recordings');

      expect(response.status).toBe(200);
      expect(response.body.recordings).toHaveLength(2);
    });
  });

  describe('GET /api/recordings/:id', () => {
    it('returns 404 when recording does not exist', async () => {
      const response = await request(app).get('/api/recordings/nonexistent');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Recording not found');
    });

    it('returns recording metadata', async () => {
      await createTestRecording('test-id', {
        name: 'Test Recording',
        mimeType: 'video/webm',
        duration: 90000,
        fileSize: 2048,
        createdAt: '2026-01-18T12:00:00Z',
      });

      const response = await request(app).get('/api/recordings/test-id');

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        id: 'test-id',
        name: 'Test Recording',
        mimeType: 'video/webm',
        duration: 90000,
        fileSize: 2048,
      });
    });
  });

  describe('GET /api/recordings/:id/video', () => {
    it('returns 404 when recording does not exist', async () => {
      const response = await request(app).get('/api/recordings/nonexistent/video');

      expect(response.status).toBe(404);
    });

    it('serves video file with correct content type', async () => {
      await createTestRecording('video-test', {
        name: 'Video Test',
        mimeType: 'video/webm',
        duration: 60000,
        fileSize: 1024,
        createdAt: '2026-01-18T12:00:00Z',
      });

      const response = await request(app).get('/api/recordings/video-test/video');

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('video/webm');
    });

    it('returns video file content', async () => {
      await createTestRecording('video-content', {
        name: 'Video Content',
        mimeType: 'video/webm',
        duration: 60000,
        fileSize: 1024,
        createdAt: '2026-01-18T12:00:00Z',
      });

      const response = await request(app)
        .get('/api/recordings/video-content/video')
        .buffer();

      expect(response.body.toString()).toBe('fake video content');
    });
  });

  describe('DELETE /api/recordings/:id', () => {
    it('returns 404 when recording does not exist', async () => {
      const response = await request(app).delete('/api/recordings/nonexistent');

      expect(response.status).toBe(404);
    });

    it('deletes recording and returns success', async () => {
      await createTestRecording('to-delete', {
        name: 'To Delete',
        mimeType: 'video/webm',
        duration: 60000,
        fileSize: 1024,
        createdAt: '2026-01-18T12:00:00Z',
      });

      const response = await request(app).delete('/api/recordings/to-delete');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('removes video file from disk', async () => {
      const recording = await createTestRecording('delete-file', {
        name: 'Delete File',
        mimeType: 'video/webm',
        duration: 60000,
        fileSize: 1024,
        createdAt: '2026-01-18T12:00:00Z',
      });

      await request(app).delete('/api/recordings/delete-file');

      const exists = await fs
        .access(recording.videoPath)
        .then(() => true)
        .catch(() => false);
      expect(exists).toBe(false);
    });

    it('removes recording from metadata', async () => {
      await createTestRecording('remove-meta', {
        name: 'Remove Meta',
        mimeType: 'video/webm',
        duration: 60000,
        fileSize: 1024,
        createdAt: '2026-01-18T12:00:00Z',
      });

      await request(app).delete('/api/recordings/remove-meta');

      // Verify recording is no longer in list
      const listResponse = await request(app).get('/api/recordings');
      expect(listResponse.body.recordings).toHaveLength(0);
    });
  });

  describe('Upload finalize saves metadata', () => {
    beforeEach(() => {
      vi.stubEnv('NODE_ENV', 'development');
    });

    afterEach(() => {
      vi.unstubAllEnvs();
    });

    it('saves recording metadata when upload finalizes', async () => {
      // Start upload
      const startResponse = await request(app).post('/api/dev/upload/start');
      const { uploadId } = startResponse.body;

      // Upload chunk
      await request(app)
        .post(`/api/dev/upload/${uploadId}/chunk`)
        .field('index', '0')
        .attach('chunk', Buffer.from('video data'), 'chunk-0');

      // Finalize with metadata
      const finalizeResponse = await request(app)
        .post(`/api/dev/upload/${uploadId}/finalize`)
        .send({
          filename: 'My Recording',
          mimeType: 'video/webm',
          totalChunks: 1,
          duration: 45000,
        });

      // Verify recording appears in list
      const listResponse = await request(app).get('/api/recordings');

      expect(listResponse.body.recordings).toHaveLength(1);
      expect(listResponse.body.recordings[0]).toMatchObject({
        id: finalizeResponse.body.fileId,
        name: 'My Recording',
        mimeType: 'video/webm',
      });
    });
  });
});
