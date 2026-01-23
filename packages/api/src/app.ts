import cors from 'cors'
import express from 'express'
import { cloudinaryRouter } from './routes/cloudinary/index.js'
import { recordingsRouter } from './routes/recordings/index.js'
import { uploadRouter } from './routes/upload/index.js'
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
app.use('/api/dev/upload', uploadRouter)
app.use('/api/recordings', recordingsRouter)
app.use('/api/users', usersRouter)

export { app }
