import express from 'express';
import cors from 'cors';
import { uploadRouter } from './routes/upload.js';
import { recordingsRouter } from './routes/recordings.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/dev/upload', uploadRouter);
app.use('/api/recordings', recordingsRouter);

export { app };
