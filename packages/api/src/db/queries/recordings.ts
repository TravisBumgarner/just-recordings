import { eq, desc } from 'drizzle-orm';
import { db } from '../index.js';
import { recordings, type Recording as DbRecording, type NewRecording } from '../schema.js';
import type { Recording } from '@just-recordings/shared';

function toRecording(row: DbRecording): Recording {
  return {
    id: row.id,
    name: row.name,
    mimeType: row.mimeType,
    duration: row.duration,
    fileSize: row.fileSize,
    createdAt: row.createdAt.toISOString(),
    path: row.path,
    thumbnailPath: row.thumbnailPath ?? undefined,
  };
}

export async function getAllRecordings(): Promise<Recording[]> {
  const rows = await db.select().from(recordings).orderBy(desc(recordings.createdAt));
  return rows.map(toRecording);
}

export async function getRecordingById(id: string): Promise<Recording | null> {
  const rows = await db.select().from(recordings).where(eq(recordings.id, id));
  if (rows.length === 0) {
    return null;
  }
  return toRecording(rows[0]);
}

export async function saveRecording(recording: Recording): Promise<void> {
  const row: NewRecording = {
    id: recording.id,
    name: recording.name,
    mimeType: recording.mimeType,
    duration: recording.duration,
    fileSize: recording.fileSize,
    createdAt: new Date(recording.createdAt),
    path: recording.path,
    thumbnailPath: recording.thumbnailPath ?? null,
  };
  await db.insert(recordings).values(row);
}

export async function deleteRecording(id: string): Promise<boolean> {
  const result = await db.delete(recordings).where(eq(recordings.id, id)).returning({ id: recordings.id });
  return result.length > 0;
}
