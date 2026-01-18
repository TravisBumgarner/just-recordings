import express from 'express';
import cors from 'cors';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/api/health', (_req, res) => {
  // Stub: returns wrong value so tests fail (TDD red phase)
  res.json({ status: 'not-ok' });
});

export { app };
