# Recording Storage Architecture Design

## Overview

Fix the recording storage architecture so that:
- **IndexedDB** serves as a temporary upload queue
- **Server** is the source of truth for viewing recordings
- **Upload status UI** monitors the IndexedDB queue

## Current Problems

1. Recording page uploads directly to server, skipping IndexedDB
2. Viewer pages read from IndexedDB (which is empty)
3. No upload queue management or status visibility
4. Recordings on disk aren't accessible through the viewer

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Web App                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐    ┌───────────────┐    ┌──────────────────┐  │
│  │  Recording   │───▶│   IndexedDB   │───▶│  Upload Manager  │  │
│  │    Page      │    │  (temp queue) │    │   (background)   │  │
│  └──────────────┘    └───────────────┘    └────────┬─────────┘  │
│                             │                      │             │
│                             ▼                      │             │
│                    ┌───────────────┐               │             │
│                    │ Upload Status │               │             │
│                    │   Component   │               │             │
│                    └───────────────┘               │             │
│                                                    │             │
│  ┌──────────────┐                                  │             │
│  │  Recordings  │◀─────────────────────────────────┼─────────┐   │
│  │    List      │                                  │         │   │
│  └──────────────┘                                  │         │   │
│         │                                          │         │   │
│         ▼                                          │         │   │
│  ┌──────────────┐                                  │         │   │
│  │  Recording   │                                  │         │   │
│  │    Viewer    │                                  │         │   │
│  └──────────────┘                                  │         │   │
│                                                    │         │   │
└────────────────────────────────────────────────────┼─────────┼───┘
                                                     │         │
                                                     ▼         │
┌─────────────────────────────────────────────────────────────────┐
│                        Server API                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  POST /api/dev/upload/start     ─┐                               │
│  POST /api/dev/upload/:id/chunk  ├── Upload endpoints            │
│  POST /api/dev/upload/:id/finalize ─┘  (saves metadata)          │
│                                                                  │
│  GET  /api/recordings           ── List recordings               │
│  GET  /api/recordings/:id       ── Get metadata                  │
│  GET  /api/recordings/:id/video ── Serve video file              │
│  DELETE /api/recordings/:id     ── Delete recording              │
│                                                                  │
│  ┌─────────────────┐    ┌─────────────────┐                      │
│  │  metadata.json  │    │  uploads/*.webm │                      │
│  │  (or SQLite)    │    │  (video files)  │                      │
│  └─────────────────┘    └─────────────────┘                      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

### Recording Flow
1. User stops recording
2. Recording saved to IndexedDB with status `pending`
3. UI shows "Recording saved, uploading..."
4. UploadManager picks up pending recording
5. Updates status to `uploading`, shows progress
6. On success: removes from IndexedDB
7. On failure: updates status to `failed`, available for retry

### Viewing Flow
1. RecordingsList calls `GET /api/recordings`
2. Server returns list of uploaded recordings
3. User clicks recording → navigates to `/recordings/:id`
4. RecordingViewer calls `GET /api/recordings/:id` for metadata
5. Video player loads from `/api/recordings/:id/video`

## Recording Type Changes

```typescript
// Add upload status tracking
interface Recording {
  id?: number;
  name: string;
  blob: Blob;
  mimeType: string;
  duration: number;
  createdAt: Date;
  fileSize: number;
  // New fields
  uploadStatus: 'pending' | 'uploading' | 'uploaded' | 'failed';
  uploadProgress?: number;
  uploadError?: string;
  serverId?: string; // ID on server after successful upload
}

// Server recording (no blob, has server path)
interface ServerRecording {
  id: string;
  name: string;
  mimeType: string;
  duration: number;
  createdAt: string;
  fileSize: number;
  path: string;
}
```

## API Endpoints

### GET /api/recordings
Returns list of all uploaded recordings.

```json
{
  "recordings": [
    {
      "id": "uuid",
      "name": "Recording 2026-01-18T...",
      "mimeType": "video/webm",
      "duration": 45000,
      "createdAt": "2026-01-18T12:00:00Z",
      "fileSize": 1048576
    }
  ]
}
```

### GET /api/recordings/:id
Returns single recording metadata.

### GET /api/recordings/:id/video
Serves the video file with:
- Proper `Content-Type: video/webm`
- Range request support for seeking

### DELETE /api/recordings/:id
Deletes recording and its video file.

## Upload Manager

```typescript
class UploadManager {
  // Start processing queue on app load
  async initialize(): Promise<void>;

  // Add recording to queue (called after stopRecording)
  async enqueue(recording: Recording): Promise<void>;

  // Retry a failed upload
  async retry(id: number): Promise<void>;

  // Cancel/remove from queue
  async cancel(id: number): Promise<void>;

  // Subscribe to queue changes
  onQueueChange(callback: (queue: Recording[]) => void): () => void;
}
```

## Dependencies

- Task 1 (API endpoints) must be done first - provides the server infrastructure
- Task 2 (upload queue) depends on Task 1 - needs endpoints to upload to
- Task 3 (viewer pages) depends on Task 1 - needs endpoints to fetch from
- Task 4 (upload status) depends on Task 2 - needs the queue to monitor
