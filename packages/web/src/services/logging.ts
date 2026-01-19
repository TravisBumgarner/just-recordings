import { captureException, captureMessage } from '@sentry/react'
import config from '../config'

export const logger = {
  info: (message: string) => {
    if (config.isProduction) {
      captureMessage(message)
    } else {
      // eslint-disable-next-line no-console
      console.log(message)
    }
  },
  error: (...args: (string | Error | unknown)[]) => {
    if (config.isProduction) {
      captureException(JSON.stringify(args))
    } else {
      // eslint-disable-next-line no-console
      console.error(args.map((arg) => JSON.stringify(arg)).join(' '))
    }
  },
}
