import type { LogContext, LoggingConfig, LogTransport } from './types'

export type { LogContext, LoggingConfig, LogTransport }

let isProduction = false
let transport: LogTransport | null = null

/**
 * Initialize the logging system with a transport.
 * Call this early in your app's lifecycle.
 *
 * @param config - Logging configuration
 * @param customTransport - Transport to use for logging (e.g., Sentry wrapper)
 */
export function initLogging(config: LoggingConfig, customTransport?: LogTransport): void {
  isProduction = config.isProduction
  transport = customTransport ?? null
}

/**
 * Log an informational message.
 * In production: sends to configured transport (e.g., Sentry)
 * In development: logs to console
 */
function info(message: string, context?: LogContext): void {
  if (isProduction && transport) {
    transport.captureMessage(message, context)
  } else {
    // biome-ignore lint/suspicious/noConsole: Development logging
    console.log(message, context ? context : '')
  }
}

/**
 * Log an error.
 * In production: sends to configured transport (e.g., Sentry)
 * In development: logs to console
 */
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
