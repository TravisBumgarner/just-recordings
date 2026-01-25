import 'dotenv/config'
import { log } from '@just-recordings/shared'
import { app } from './app.js'
import config from './config.js'
import { initSentry } from './sentry.js'

// Initialize Sentry and logging first
initSentry()

app.listen(config.port, () => {
  log.info(`API server running on port ${config.port}`)
})
