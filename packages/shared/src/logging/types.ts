export interface LoggingConfig {
  isProduction: boolean
}

export interface LogContext {
  [key: string]: unknown
}

export interface LogTransport {
  captureMessage: (message: string, context?: LogContext) => void
  captureException: (error: Error | string, context?: LogContext) => void
}
