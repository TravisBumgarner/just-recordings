import { app } from 'electron'
import { initLogging, type LogTransport } from '@just-recordings/shared'

// Sentry DSN from environment variable
const SENTRY_DSN = process.env.SENTRY_DSN

// Check if running in production (packaged app)
const isProduction = app.isPackaged

// Dynamic import for Sentry to avoid issues in development
let Sentry: typeof import('@sentry/electron').default | null = null

/**
 * Create a Sentry transport for the shared logging utility
 */
function createSentryTransport(): LogTransport {
  return {
    captureMessage: (message, context) => {
      if (Sentry) {
        Sentry.captureMessage(message, {
          extra: context,
        })
      }
    },
    captureException: (error, context) => {
      if (Sentry) {
        if (typeof error === 'string') {
          Sentry.captureException(new Error(error), {
            extra: context,
          })
        } else {
          Sentry.captureException(error, {
            extra: context,
          })
        }
      }
    },
  }
}

/**
 * Initialize Sentry and logging for the Electron main process.
 * Only initializes Sentry in production (packaged builds) with a valid DSN.
 */
export async function initSentry(): Promise<void> {
  const shouldInitSentry = isProduction && SENTRY_DSN

  if (shouldInitSentry) {
    // Dynamically import Sentry only when needed
    const SentryModule = await import('@sentry/electron')
    Sentry = SentryModule.default

    Sentry.init({
      dsn: SENTRY_DSN,
      environment: 'production',
    })
  }

  // Initialize shared logging with Sentry transport (if in production)
  initLogging(
    {
      isProduction,
      sentryDsn: SENTRY_DSN,
    },
    shouldInitSentry ? createSentryTransport() : undefined,
  )
}
