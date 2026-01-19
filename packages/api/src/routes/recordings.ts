import { Router, Request, Response } from 'express';
import fs from 'fs/promises';
import path from 'path';

const router = Router();

const UPLOADS_DIR = 'uploads';
const METADATA_FILE = path.join(UPLOADS_DIR, 'metadata.json');

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

// Helper to read all metadata
async function readMetadata(): Promise<Record<string, RecordingMetadata>> {
  try {
    const content = await fs.readFile(METADATA_FILE, 'utf-8');
    return JSON.parse(content);
  } catch {
    return {};
  }
}

// Helper to write metadata
async function writeMetadata(metadata: Record<string, RecordingMetadata>): Promise<void> {
  await fs.mkdir(UPLOADS_DIR, { recursive: true });
  await fs.writeFile(METADATA_FILE, JSON.stringify(metadata, null, 2));
}

// Helper to save a single recording's metadata
export async function saveRecordingMetadata(recording: RecordingMetadata): Promise<void> {
  const metadata = await readMetadata();
  metadata[recording.id] = recording;
  await writeMetadata(metadata);
}

// GET /api/recordings - List all recordings
router.get('/', async (_req: Request, res: Response) => {
  const metadata = await readMetadata();
  const recordings = Object.values(metadata);
  res.json({ recordings });
});

// GET /api/recordings/:id - Get single recording metadata
router.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const metadata = await readMetadata();
  const recording = metadata[id];

  if (!recording) {
    res.status(404).json({ error: 'Recording not found' });
    return;
  }

  res.json(recording);
});

// GET /api/recordings/:id/video - Serve video file
router.get('/:id/video', async (req: Request, res: Response) => {
  const { id } = req.params;
  const metadata = await readMetadata();
  const recording = metadata[id];

  if (!recording) {
    res.status(404).json({ error: 'Recording not found' });
    return;
  }

  // Check if file exists
  try {
    await fs.access(recording.path);
  } catch {
    res.status(404).json({ error: 'Video file not found' });
    return;
  }

  res.setHeader('Content-Type', recording.mimeType);
  const fileContent = await fs.readFile(recording.path);
  res.send(fileContent);
});

// GET /api/recordings/:id/thumbnail - Serve thumbnail image
router.get('/:id/thumbnail', async (req: Request, res: Response) => {
  const { id } = req.params;
  const metadata = await readMetadata();
  const recording = metadata[id];

  if (!recording) {
    res.status(404).json({ error: 'Recording not found' });
    return;
  }

  if (!recording.thumbnailPath) {
    res.status(404).json({ error: 'Thumbnail not found' });
    return;
  }

  try {
    await fs.access(recording.thumbnailPath);
  } catch {
    res.status(404).json({ error: 'Thumbnail file not found' });
    return;
  }

  res.setHeader('Content-Type', 'image/jpeg');
  const fileContent = await fs.readFile(recording.thumbnailPath);
  res.send(fileContent);
});

// DELETE /api/recordings/:id - Delete recording
router.delete('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const metadata = await readMetadata();
  const recording = metadata[id];

  if (!recording) {
    res.status(404).json({ error: 'Recording not found' });
    return;
  }

  // Delete video file
  try {
    await fs.unlink(recording.path);
  } catch {
    // File might already be deleted, continue
  }

  // Delete thumbnail file if it exists
  if (recording.thumbnailPath) {
    try {
      await fs.unlink(recording.thumbnailPath);
    } catch {
      // Thumbnail might already be deleted, continue
    }
  }

  // Remove from metadata
  delete metadata[id];
  await writeMetadata(metadata);

  res.json({ success: true });
});

export { router as recordingsRouter };
