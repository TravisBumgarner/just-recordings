/**
 * Configuration for initializing the logging transport
 */
export interface LoggingConfig {
  /** Whether the app is running in production mode */
  isProduction: boolean
  /** Sentry DSN (Data Source Name) - only used in production */
  sentryDsn?: string
}

/**
 * Context object for additional error metadata
 */
export interface LogContext {
  [key: string]: unknown
}

/**
 * Transport interface for logging backends (Sentry, console, etc.)
 */
export interface LogTransport {
  captureMessage: (message: string, context?: LogContext) => void
  captureException: (error: Error | string, context?: LogContext) => void
}
