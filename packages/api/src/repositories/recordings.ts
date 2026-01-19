import { eq, desc } from 'drizzle-orm';
import { db } from '../db/index.js';
import { recordings, type Recording, type NewRecording } from '../db/schema.js';

export interface RecordingMetadata {
  id: string;
  name: string;
  mimeType: string;
  duration: number;
  fileSize: number;
  createdAt: string;
  path: string;
  thumbnailPath?: string;
}

function toMetadata(row: Recording): RecordingMetadata {
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

export async function getAllRecordings(): Promise<RecordingMetadata[]> {
  const rows = await db.select().from(recordings).orderBy(desc(recordings.createdAt));
  return rows.map(toMetadata);
}

export async function getRecordingById(id: string): Promise<RecordingMetadata | null> {
  const rows = await db.select().from(recordings).where(eq(recordings.id, id));
  if (rows.length === 0) {
    return null;
  }
  return toMetadata(rows[0]);
}

export async function saveRecording(metadata: RecordingMetadata): Promise<void> {
  const row: NewRecording = {
    id: metadata.id,
    name: metadata.name,
    mimeType: metadata.mimeType,
    duration: metadata.duration,
    fileSize: metadata.fileSize,
    createdAt: new Date(metadata.createdAt),
    path: metadata.path,
    thumbnailPath: metadata.thumbnailPath ?? null,
  };
  await db.insert(recordings).values(row);
}

export async function deleteRecording(id: string): Promise<boolean> {
  const result = await db.delete(recordings).where(eq(recordings.id, id)).returning({ id: recordings.id });
  return result.length > 0;
}
