import { initLogging } from '@just-recordings/shared'
import * as Sentry from '@sentry/electron'
import { app } from 'electron'

const DSN = 'https://3d95c24444d6d9259dd763bc9108b63e@o196886.ingest.us.sentry.io/4510785085767680'

export function initSentry(): void {
  const isProduction = app.isPackaged

  if (isProduction) {
    Sentry.init({
      dsn: DSN,
      environment: 'production',
    })
  }

  initLogging(
    { isProduction },
    isProduction
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
