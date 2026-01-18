# Upload Feature Design

## Overview

This feature adds the ability to upload screen recordings from the web and desktop apps to a backend server. For development, recordings are uploaded to the Express API and stored locally. Production uploads are stubbed for future cloud storage integration.

## Architecture

### Chunked Upload Flow

1. **Start Upload**: Client initiates upload session, receives `uploadId`
2. **Upload Chunks**: Client splits blob into chunks and uploads each with its index
3. **Finalize**: Client signals completion, server merges chunks into final file

This approach:
- Handles large files without memory issues
- Allows progress tracking
- Enables future resumable uploads

### Component Responsibilities

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Web/Desktop   │────▶│    Uploader     │────▶│   Express API   │
│   Recording UI  │     │   (recorder)    │     │  (dev only)     │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │                       │
        ▼                       ▼                       ▼
  RecorderService         DevUploader/            /api/dev/upload/*
  (screen capture)        ProdUploader            (chunk storage)
```

## API Endpoints (Development Only)

All endpoints are prefixed with `/api/dev/` and only available when `NODE_ENV=development`.

### POST /api/dev/upload/start

Initiates a new upload session.

**Response:**
```json
{
  "uploadId": "uuid-v4-string"
}
```

### POST /api/dev/upload/:uploadId/chunk

Uploads a single chunk.

**Request:** `multipart/form-data`
- `chunk`: Blob data
- `index`: Chunk sequence number (0-based)

**Response:**
```json
{
  "received": true,
  "index": 0
}
```

### POST /api/dev/upload/:uploadId/finalize

Merges chunks and creates final file.

**Request:**
```json
{
  "filename": "recording-2026-01-18.webm",
  "mimeType": "video/webm",
  "totalChunks": 5
}
```

**Response:**
```json
{
  "success": true,
  "fileId": "uuid",
  "path": "./uploads/uuid.webm",
  "size": 1234567
}
```

## Uploader Interface

```typescript
interface Uploader {
  startUpload(): Promise<string>;
  uploadChunk(uploadId: string, chunk: Blob, index: number): Promise<void>;
  finalizeUpload(uploadId: string, metadata: UploadMetadata): Promise<UploadResult>;
}

interface UploadMetadata {
  filename: string;
  mimeType: string;
  totalChunks: number;
}

interface UploadResult {
  success: boolean;
  fileId: string;
  path: string;
  size: number;
}
```

### Implementations

- **DevUploader**: Makes HTTP calls to Express backend
- **ProdUploader**: Stub that throws "Not implemented" (future: S3, GCS, etc.)

## File Storage (Development)

```
packages/api/
├── uploads/           # Final merged videos
│   └── {uploadId}.webm
└── .tmp/              # Temporary chunk storage
    └── {uploadId}/
        ├── chunk-0
        ├── chunk-1
        └── ...
```

## Security Considerations

- Dev endpoints return 404 in production (not 403, to avoid revealing existence)
- Uploads directory should be gitignored
- No authentication for dev endpoints (local development only)
- Future: Add authentication, file size limits, virus scanning for production

## UI Components

### Recording Page

Both web and desktop apps will have a Recording page with:

1. **Start Recording** button - Calls `RecorderService.startScreenRecording()`
2. **Stop Recording** button - Calls `stopRecording()`, then uploads via Uploader
3. **Progress indicator** - Shows upload progress (chunks uploaded / total)
4. **Status messages** - Recording state, upload success/failure

### State Flow

```
idle → recording → uploading → complete
         │              │
         ▼              ▼
       error          error
```
