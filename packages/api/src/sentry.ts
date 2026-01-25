import * as Sentry from '@sentry/node'
import { initLogging, type LogTransport } from '@just-recordings/shared'
import config from './config.js'

// Sentry DSN from environment variable
const SENTRY_DSN = process.env.SENTRY_DSN

/**
 * Create a Sentry transport for the shared logging utility
 */
function createSentryTransport(): LogTransport {
  return {
    captureMessage: (message, context) => {
      Sentry.captureMessage(message, {
        extra: context,
      })
    },
    captureException: (error, context) => {
      if (typeof error === 'string') {
        Sentry.captureException(new Error(error), {
          extra: context,
        })
      } else {
        Sentry.captureException(error, {
          extra: context,
        })
      }
    },
  }
}

/**
 * Initialize Sentry and logging for the API server.
 * Only initializes Sentry in production with a valid DSN.
 */
export function initSentry(): void {
  const shouldInitSentry = config.isProduction && SENTRY_DSN

  if (shouldInitSentry) {
    Sentry.init({
      dsn: SENTRY_DSN,
      environment: 'production',
      tracesSampleRate: 0.1,
    })
  }

  // Initialize shared logging with Sentry transport (if in production)
  initLogging(
    {
      isProduction: config.isProduction,
      sentryDsn: SENTRY_DSN,
    },
    shouldInitSentry ? createSentryTransport() : undefined,
  )
}

/**
 * Get Sentry middleware for Express.
 * Returns empty array if Sentry is not configured.
 */
export function getSentryMiddleware(): {
  requestHandler: ReturnType<typeof Sentry.Handlers.requestHandler> | null
  errorHandler: ReturnType<typeof Sentry.Handlers.errorHandler> | null
} {
  const shouldInitSentry = config.isProduction && SENTRY_DSN

  if (shouldInitSentry) {
    return {
      requestHandler: Sentry.Handlers.requestHandler(),
      errorHandler: Sentry.Handlers.errorHandler(),
    }
  }

  return {
    requestHandler: null,
    errorHandler: null,
  }
}
