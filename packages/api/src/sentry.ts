import { initLogging } from '@just-recordings/shared'
import * as Sentry from '@sentry/node'
import type { Express } from 'express'
import config from './config.js'

const DSN = 'https://70748d1a1e4c0c52700ca7ffe45abd2e@o196886.ingest.us.sentry.io/4510784882737152'

export function initSentry(): void {
  if (config.isProduction) {
    Sentry.init({
      dsn: DSN,
      environment: 'production',
      tracesSampleRate: 0.1,
    })
  }

  initLogging(
    { isProduction: config.isProduction },
    config.isProduction
      ? {
          captureMessage: (message, context) => Sentry.captureMessage(message, { extra: context }),
          captureException: (error, context) =>
            Sentry.captureException(typeof error === 'string' ? new Error(error) : error, {
              extra: context,
            }),
        }
      : undefined,
  )
}

export function setupSentryErrorHandler(app: Express): void {
  if (config.isProduction) {
    Sentry.setupExpressErrorHandler(app)
  }
}
