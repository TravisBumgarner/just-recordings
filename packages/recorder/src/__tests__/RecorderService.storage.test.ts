import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { RecorderService } from '../RecorderService';
import { RecorderDatabase } from '../db';
import { Recording } from '../types';

describe('RecorderService storage operations', () => {
  let service: RecorderService;
  let db: RecorderDatabase;

  const createTestRecording = (overrides?: Partial<Recording>): Recording => ({
    name: 'Test Recording',
    blob: new Blob(['test data'], { type: 'video/webm' }),
    mimeType: 'video/webm',
    duration: 5000,
    createdAt: new Date(),
    fileSize: 1024,
    ...overrides,
  });

  beforeEach(() => {
    db = new RecorderDatabase();
    service = new RecorderService(db);
  });

  afterEach(async () => {
    await db.delete();
  });

  describe('constructor', () => {
    it('accepts an optional database instance', () => {
      const customDb = new RecorderDatabase();
      const customService = new RecorderService(customDb);
      expect(customService).toBeInstanceOf(RecorderService);
    });

    it('creates a default database if none provided', () => {
      const defaultService = new RecorderService();
      expect(defaultService).toBeInstanceOf(RecorderService);
    });
  });

  describe('saveRecording', () => {
    it('stores recording in database and returns id', async () => {
      const recording = createTestRecording();
      const id = await service.saveRecording(recording);
      expect(id).toBeGreaterThan(0);
    });

    it('persists the recording data', async () => {
      const recording = createTestRecording({ name: 'My Video' });
      const id = await service.saveRecording(recording);

      const saved = await db.recordings.get(id);
      expect(saved?.name).toBe('My Video');
    });
  });

  describe('getRecording', () => {
    it('retrieves a recording by id', async () => {
      const recording = createTestRecording({ name: 'Retrievable' });
      const id = await service.saveRecording(recording);

      const retrieved = await service.getRecording(id);
      expect(retrieved?.name).toBe('Retrievable');
    });

    it('returns undefined for non-existent id', async () => {
      const retrieved = await service.getRecording(99999);
      expect(retrieved).toBeUndefined();
    });
  });

  describe('getAllRecordings', () => {
    it('returns empty array when no recordings', async () => {
      const recordings = await service.getAllRecordings();
      expect(recordings).toEqual([]);
    });

    it('returns all recordings', async () => {
      await service.saveRecording(createTestRecording({ name: 'First' }));
      await service.saveRecording(createTestRecording({ name: 'Second' }));

      const recordings = await service.getAllRecordings();
      expect(recordings).toHaveLength(2);
    });

    it('returns recordings ordered by createdAt descending', async () => {
      const older = createTestRecording({
        name: 'Older',
        createdAt: new Date('2026-01-01'),
      });
      const newer = createTestRecording({
        name: 'Newer',
        createdAt: new Date('2026-01-15'),
      });

      await service.saveRecording(older);
      await service.saveRecording(newer);

      const recordings = await service.getAllRecordings();
      expect(recordings[0].name).toBe('Newer');
      expect(recordings[1].name).toBe('Older');
    });
  });

  describe('deleteRecording', () => {
    it('removes a recording from the database', async () => {
      const recording = createTestRecording();
      const id = await service.saveRecording(recording);

      await service.deleteRecording(id);

      const deleted = await service.getRecording(id);
      expect(deleted).toBeUndefined();
    });

    it('does not throw for non-existent id', async () => {
      await expect(service.deleteRecording(99999)).resolves.not.toThrow();
    });
  });
});
