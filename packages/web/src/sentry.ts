import * as Sentry from '@sentry/react'
import { initLogging, type LogTransport } from '@just-recordings/shared'
import config from './config'

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
 * Initialize Sentry and logging for the web app.
 * Only initializes Sentry in production with a valid DSN.
 */
export function initSentry(): void {
  const shouldInitSentry = config.isProduction && config.sentryDsn

  if (shouldInitSentry) {
    Sentry.init({
      dsn: config.sentryDsn,
      environment: 'production',
      // Capture unhandled promise rejections
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration(),
      ],
      // Performance monitoring sample rate
      tracesSampleRate: 0.1,
      // Session replay sample rate
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
    })
  }

  // Initialize shared logging with Sentry transport (if in production)
  initLogging(
    {
      isProduction: config.isProduction,
      sentryDsn: config.sentryDsn,
    },
    shouldInitSentry ? createSentryTransport() : undefined,
  )
}
