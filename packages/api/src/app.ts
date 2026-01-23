import path from 'node:path'
import cors from 'cors'
import express from 'express'
import config from './config.js'
import { cloudinaryRouter } from './routes/cloudinary/index.js'
import { recordingsRouter } from './routes/recordings/index.js'
import { usersRouter } from './routes/users.js'

const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// Routes
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api/upload', cloudinaryRouter)
app.use('/api/recordings', recordingsRouter)
app.use('/api/users', usersRouter)

// In production, serve the frontend static files
if (config.isProduction) {
  const webDistPath = path.join(import.meta.dirname, '../../web/dist')

  // Serve static files from the web build directory
  app.use(express.static(webDistPath))

  // SPA fallback: serve index.html for all non-API routes
  app.get('*', (_req, res) => {
    res.sendFile(path.join(webDistPath, 'index.html'))
  })
}

export { app }
