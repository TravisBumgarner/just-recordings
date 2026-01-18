import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';

const router = Router();
const upload = multer({ dest: '.tmp/' });

// Dev-only middleware - returns 404 if not in development
export function devOnly(_req: Request, res: Response, next: NextFunction): void {
  if (process.env.NODE_ENV !== 'development') {
    res.status(404).json({ error: 'Not found' });
    return;
  }
  next();
}

// Apply dev-only middleware to all routes
router.use(devOnly);

// POST /api/dev/upload/start - Create new upload session
router.post('/start', (_req: Request, res: Response) => {
  // Stub: return empty uploadId
  res.json({ uploadId: '' });
});

// POST /api/dev/upload/:uploadId/chunk - Upload a chunk
router.post(
  '/:uploadId/chunk',
  upload.single('chunk'),
  (_req: Request, res: Response) => {
    // Stub: return received false
    res.json({ received: false, index: -1 });
  }
);

// POST /api/dev/upload/:uploadId/finalize - Merge chunks into final file
router.post('/:uploadId/finalize', (_req: Request, res: Response) => {
  // Stub: return empty result
  res.json({ success: false, fileId: '', path: '', size: 0 });
});

export { router as uploadRouter };
