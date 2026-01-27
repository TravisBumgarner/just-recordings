import type { LogContext, LoggingConfig, LogTransport } from './types'

export type { LogContext, LoggingConfig, LogTransport }

let isProduction = false
let transport: LogTransport | null = null

export function initLogging(config: LoggingConfig, customTransport?: LogTransport): void {
  isProduction = config.isProduction
  transport = customTransport ?? null
}

function info(message: string, context?: LogContext): void {
  if (isProduction && transport) {
    transport.captureMessage(message, context)
  } else {
    // biome-ignore lint/suspicious/noConsole: Development logging
    console.log(message, context ? context : '')
  }
}

function error(err: Error | string, context?: LogContext): void {
  if (isProduction && transport) {
    transport.captureException(err, context)
  } else {
    // biome-ignore lint/suspicious/noConsole: Development logging
    console.error(err, context ? context : '')
  }
}

export const log = {
  info,
  error,
}
