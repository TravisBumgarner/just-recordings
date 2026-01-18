import { Router, Request, Response } from 'express';

const router = Router();

// GET /api/recordings - List all recordings
router.get('/', async (_req: Request, res: Response) => {
  res.json({ recordings: [] });
});

// GET /api/recordings/:id - Get single recording metadata
router.get('/:id', async (req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found' });
});

// GET /api/recordings/:id/video - Serve video file
router.get('/:id/video', async (req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found' });
});

// DELETE /api/recordings/:id - Delete recording
router.delete('/:id', async (req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found' });
});

export { router as recordingsRouter };
