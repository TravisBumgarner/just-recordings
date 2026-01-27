import { initLogging } from '@just-recordings/shared'
import * as Sentry from '@sentry/react'
import config from './config'

const DSN = 'https://7213e102d4077c4fb5aec45ae1dfb113@o196886.ingest.us.sentry.io/4510784837451776'

export function initSentry(): void {
  if (config.isProduction) {
    Sentry.init({
      dsn: DSN,
      environment: 'production',
      integrations: [Sentry.browserTracingIntegration(), Sentry.replayIntegration()],
      tracesSampleRate: 0.1,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
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
