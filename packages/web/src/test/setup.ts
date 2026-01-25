import '@testing-library/jest-dom'
import 'fake-indexeddb/auto'
import { initLogging } from '@just-recordings/shared'

// Initialize logging for tests (uses console transport in non-production)
initLogging({ isProduction: false })
