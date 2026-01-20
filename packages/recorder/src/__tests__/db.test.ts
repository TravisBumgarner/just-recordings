import { describe, it, expect, beforeEach } from 'vitest'
import { RecorderDatabase } from '../db'
import { Recording } from '../types'

describe('RecorderDatabase', () => {
  let db: RecorderDatabase

  beforeEach(() => {
    db = new RecorderDatabase()
  })

  it('can be instantiated', () => {
    expect(db).toBeInstanceOf(RecorderDatabase)
  })

  it('has a recordings table', () => {
    expect(db.recordings).toBeDefined()
  })

  it('uses the correct database name', () => {
    expect(db.name).toBe('JustRecordingsDB')
  })

  describe('recordings table', () => {
    it('can add a recording', async () => {
      const recording: Recording = {
        name: 'Test Recording',
        blob: new Blob(['test'], { type: 'video/webm' }),
        mimeType: 'video/webm',
        duration: 5000,
        createdAt: new Date(),
        fileSize: 1024,
      }

      const id = await db.recordings.add(recording)
      expect(id).toBeGreaterThan(0)
    })

    it('can retrieve a recording by id', async () => {
      const recording: Recording = {
        name: 'Test Recording',
        blob: new Blob(['test'], { type: 'video/webm' }),
        mimeType: 'video/webm',
        duration: 5000,
        createdAt: new Date(),
        fileSize: 1024,
      }

      const id = await db.recordings.add(recording)
      const retrieved = await db.recordings.get(id)

      expect(retrieved).toBeDefined()
      expect(retrieved?.name).toBe('Test Recording')
    })

    it('auto-increments the id', async () => {
      const recording1: Recording = {
        name: 'Recording 1',
        blob: new Blob(['test'], { type: 'video/webm' }),
        mimeType: 'video/webm',
        duration: 1000,
        createdAt: new Date(),
        fileSize: 512,
      }

      const recording2: Recording = {
        name: 'Recording 2',
        blob: new Blob(['test2'], { type: 'video/webm' }),
        mimeType: 'video/webm',
        duration: 2000,
        createdAt: new Date(),
        fileSize: 1024,
      }

      const id1 = await db.recordings.add(recording1)
      const id2 = await db.recordings.add(recording2)

      expect(id2).toBeGreaterThan(id1)
    })
  })
})
