import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { randomUUID } from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { saveRecordingMetadata } from './recordings.js';

const router = Router();

// UUID v4 format validation regex
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isValidUUID(id: string): boolean {
  return UUID_REGEX.test(id);
}

// Validate chunk index is a non-negative integer (prevents path traversal)
function isValidChunkIndex(index: string): boolean {
  const num = parseInt(index, 10);
  return /^\d+$/.test(index) && Number.isInteger(num) && num >= 0;
}

// Configure multer with custom storage to handle chunk files
const storage = multer.diskStorage({
  destination: async (req, _file, cb) => {
    const uploadId = req.params.uploadId;
    // Validate uploadId to prevent path traversal
    if (!isValidUUID(uploadId)) {
      cb(new Error('Invalid upload ID'), '');
      return;
    }
    const chunkDir = path.join('.tmp', uploadId);
    try {
      await fs.mkdir(chunkDir, { recursive: true });
      cb(null, chunkDir);
    } catch (error) {
      cb(error as Error, chunkDir);
    }
  },
  filename: (req, _file, cb) => {
    const index = req.body.index || '0';
    // Validate index to prevent path traversal
    if (!isValidChunkIndex(index)) {
      cb(new Error('Invalid chunk index'), '');
      return;
    }
    cb(null, `chunk-${index}`);
  },
});

const upload = multer({ storage });

// Dev-only middleware - returns 404 if not in development
export function devOnly(
  _req: Request,
  res: Response,
  next: NextFunction
): void {
  if (process.env.NODE_ENV !== 'development') {
    res.status(404).json({ error: 'Not found' });
    return;
  }
  next();
}

// Apply dev-only middleware to all routes
router.use(devOnly);

// POST /api/dev/upload/start - Create new upload session
router.post('/start', async (_req: Request, res: Response) => {
  const uploadId = randomUUID();

  // Create temp directory for chunks
  const chunkDir = path.join('.tmp', uploadId);
  await fs.mkdir(chunkDir, { recursive: true });

  res.json({ uploadId });
});

// POST /api/dev/upload/:uploadId/chunk - Upload a chunk
router.post(
  '/:uploadId/chunk',
  upload.single('chunk'),
  (req: Request, res: Response) => {
    const index = parseInt(req.body.index || '0', 10);
    res.json({ received: true, index });
  }
);

// POST /api/dev/upload/:uploadId/finalize - Merge chunks into final file
router.post('/:uploadId/finalize', async (req: Request, res: Response) => {
  const { uploadId } = req.params;
  const { totalChunks, filename, mimeType, duration } = req.body;

  // Validate uploadId to prevent path traversal
  if (!isValidUUID(uploadId)) {
    res.status(400).json({ error: 'Invalid upload ID' });
    return;
  }

  // Validate totalChunks is a positive integer
  const numChunks = parseInt(totalChunks, 10);
  if (!Number.isInteger(numChunks) || numChunks <= 0) {
    res.status(400).json({ error: 'Invalid totalChunks value' });
    return;
  }

  const chunkDir = path.join('.tmp', uploadId);
  const uploadsDir = 'uploads';
  const fileId = randomUUID();
  const finalPath = path.join(uploadsDir, `${fileId}.webm`);

  // Ensure uploads directory exists
  await fs.mkdir(uploadsDir, { recursive: true });

  // Read and merge chunks in order
  const chunks: Buffer[] = [];
  try {
    for (let i = 0; i < numChunks; i++) {
      const chunkPath = path.join(chunkDir, `chunk-${i}`);
      const chunkData = await fs.readFile(chunkPath);
      chunks.push(chunkData);
    }
  } catch (error) {
    res.status(400).json({ error: 'Missing or invalid chunks' });
    return;
  }

  // Write merged file
  const mergedData = Buffer.concat(chunks);
  await fs.writeFile(finalPath, mergedData);

  // Save recording metadata
  await saveRecordingMetadata({
    id: fileId,
    name: filename || 'Untitled Recording',
    mimeType: mimeType || 'video/webm',
    duration: duration || 0,
    fileSize: mergedData.length,
    createdAt: new Date().toISOString(),
    path: finalPath,
  });

  // Cleanup temp directory
  await fs.rm(chunkDir, { recursive: true, force: true });

  res.json({
    success: true,
    fileId,
    path: finalPath,
    size: mergedData.length,
  });
});

export { router as uploadRouter };
