# Recorder Package Design

## Overview

A minimal, shared video/screen recorder package (`@just-recordings/recorder`) that can be imported and used by both the Electron desktop app and the React web app. The package uses [Dexie.js](https://dexie.org/) for IndexedDB storage of recordings.

## Architecture

```
packages/recorder/
├── src/
│   ├── index.ts              # Public exports
│   ├── db.ts                 # Dexie database schema
│   ├── types.ts              # TypeScript types
│   ├── RecorderService.ts    # Core recording logic
│   └── __tests__/            # Unit tests
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

## Core Components

### 1. Database Schema (Dexie)

The package uses Dexie.js to wrap IndexedDB for storing recordings.

**Recording Entity:**
```typescript
interface Recording {
  id?: number;              // Auto-incremented primary key
  name: string;             // User-friendly name
  blob: Blob;               // The recorded video data
  mimeType: string;         // e.g., "video/webm"
  duration: number;         // Duration in milliseconds
  createdAt: Date;          // When recording was created
  fileSize: number;         // Size in bytes
}
```

**Database Class:**
```typescript
class RecorderDatabase extends Dexie {
  recordings!: Table<Recording, number>;

  constructor() {
    super('JustRecordingsDB');
    this.version(1).stores({
      recordings: '++id, name, createdAt'
    });
  }
}
```

### 2. RecorderService

A service class that encapsulates recording logic using the [MediaRecorder API](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder).

**States:**
- `idle` - Not recording
- `recording` - Actively recording
- `paused` - Recording paused

**Methods:**
```typescript
interface RecorderService {
  // Recording control
  startScreenRecording(options?: RecordingOptions): Promise<void>;
  stopRecording(): Promise<Recording>;
  pauseRecording(): void;
  resumeRecording(): void;

  // State
  getState(): RecorderState;
  onStateChange(callback: (state: RecorderState) => void): () => void;

  // Storage operations
  saveRecording(recording: Recording): Promise<number>;
  getRecording(id: number): Promise<Recording | undefined>;
  getAllRecordings(): Promise<Recording[]>;
  deleteRecording(id: number): Promise<void>;
}
```

**Recording Options:**
```typescript
interface RecordingOptions {
  mimeType?: string;        // Default: 'video/webm'
  videoBitsPerSecond?: number;
  audioBitsPerSecond?: number;
}
```

### 3. Public API

The package exports:
- `RecorderService` class
- `RecorderDatabase` class (for direct DB access if needed)
- All TypeScript types

## Technical Decisions

### MIME Type
Default to `video/webm` as it has the broadest browser support for MediaRecorder. Use `MediaRecorder.isTypeSupported()` to verify.

### Chunk Collection
Use `ondataavailable` event with `timeslice` parameter to collect chunks periodically (every 1 second) rather than all at once at the end. This prevents memory issues with long recordings.

### Error Handling
- Wrap all async operations in try-catch
- Provide meaningful error messages
- Export custom error types for specific failure modes

### Browser/Electron Compatibility
The package uses only standard Web APIs available in both:
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Electron renderer process

No Node.js-specific APIs are used.

## Integration

### Web App Usage
```typescript
import { RecorderService } from '@just-recordings/recorder';

const recorder = new RecorderService();
await recorder.startScreenRecording();
// ... user records ...
const recording = await recorder.stopRecording();
await recorder.saveRecording(recording);
```

### Electron App Usage
Same API - the package works identically in Electron's renderer process.

## Testing Strategy

- Unit tests for RecorderService using mocked MediaRecorder
- Unit tests for database operations using fake-indexeddb
- All tests run with Vitest

## Dependencies

- `dexie` - IndexedDB wrapper
- `vitest` - Testing (dev)
- `fake-indexeddb` - IndexedDB mock for tests (dev)
