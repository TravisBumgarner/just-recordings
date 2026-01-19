# Homepage Video Grid Redesign

## Overview

Transform the web app homepage from a simple landing page to a dashboard showing a grid of recorded videos with thumbnails. The upload queue should be displayed above the grid, and the "Start Recording" button should be positioned in the top right corner.

## Current State

The current homepage (`packages/web/src/pages/Home.tsx`) is a simple landing page with:
- Title "Just Recordings" and description
- Three navigation buttons: Start Recording, View Recordings, Upload Queue

The video grid functionality exists separately in `RecordingsList.tsx`, and the upload queue is on its own page at `/uploads`.

## Requirements

1. **Video Grid on Homepage**: Display all recordings in a responsive grid layout with thumbnails
2. **Start Recording Button**: Reposition to top right corner for easy access
3. **Upload Queue**: Show pending uploads as a list above the video grid
4. **Thumbnails**: Generate thumbnails from the first frame of videos on the backend

## Design

### Backend Changes

#### 1. RecordingMetadata Type Update

Add optional `thumbnailPath` field to track thumbnail location:

```typescript
interface RecordingMetadata {
  id: string;
  name: string;
  mimeType: string;
  duration: number;
  fileSize: number;
  createdAt: string;
  path: string;
  thumbnailPath?: string;  // NEW: path to thumbnail image
}
```

#### 2. Thumbnail Generation

During upload finalization (`POST /api/dev/upload/:uploadId/finalize`):
1. After merging video chunks into final file
2. Use ffmpeg to extract first frame: `ffmpeg -i video.webm -ss 00:00:00 -vframes 1 -vf scale=320:-1 thumb.jpg`
3. Save thumbnail as `{fileId}-thumb.jpg` in uploads directory
4. Store path in metadata

Use `fluent-ffmpeg` with `ffmpeg-static` for Node.js integration.

#### 3. Thumbnail Serving Endpoint

```
GET /api/recordings/:id/thumbnail
```

- Returns thumbnail image with `Content-Type: image/jpeg`
- Returns 404 if recording not found or no thumbnail exists

#### 4. Thumbnail Cleanup on Delete

When deleting a recording, also delete the associated thumbnail file.

### Frontend Changes

#### 1. Homepage Layout

```
+----------------------------------------------------------+
| Just Recordings                       [Start Recording]  |
+----------------------------------------------------------+
| Upload Queue (2 items)                                   |
| +------------------------------------------------------+ |
| | video-1.webm    [Uploading] ====>    45%  [Cancel]   | |
| | video-2.webm    [Pending]                 [Cancel]   | |
| +------------------------------------------------------+ |
+----------------------------------------------------------+
| +----------+ +----------+ +----------+                   |
| | [thumb]  | | [thumb]  | | [thumb]  |                   |
| | Video 1  | | Video 2  | | Video 3  |                   |
| | 2:30     | | 1:45     | | 5:12     |                   |
| | Jan 15   | | Jan 14   | | Jan 13   |                   |
| +----------+ +----------+ +----------+                   |
| +----------+ +----------+ +----------+                   |
| | [thumb]  | | [thumb]  | | [thumb]  |                   |
| ...                                                      |
+----------------------------------------------------------+
```

#### 2. Component Changes

**Home.tsx**:
- Accept `uploadManager` prop
- Fetch recordings from API
- Display responsive grid (xs=12, sm=6, md=4)
- Show thumbnail in each card (with placeholder fallback)
- Include upload queue section above grid
- Position Start Recording button in top right

**App.tsx**:
- Pass `uploadManager` to Home component

**api.ts**:
- Add `getThumbnailUrl(id: string)` helper function

### API Service Update

```typescript
// packages/web/src/services/api.ts
export function getThumbnailUrl(id: string): string {
  return `${BASE_URL}/recordings/${id}/thumbnail`;
}
```

## File Changes Summary

### Backend (packages/api)
- `package.json` - Add fluent-ffmpeg, ffmpeg-static dependencies
- `src/routes/recordings.ts` - Add thumbnailPath to interface, add thumbnail endpoint, update delete
- `src/routes/upload.ts` - Add thumbnail generation in finalize

### Frontend (packages/web)
- `src/types/api.ts` - Add thumbnailPath to RecordingMetadata
- `src/services/api.ts` - Add getThumbnailUrl helper
- `src/App.tsx` - Pass uploadManager to Home
- `src/pages/Home.tsx` - Complete redesign with grid, thumbnails, upload queue

## Error Handling

- Thumbnail generation failure should not fail the upload (thumbnail is optional)
- Missing thumbnails should show a placeholder image in the UI
- Upload queue errors should be displayed with retry option

## Testing Strategy

- Unit tests for thumbnail generation logic
- Unit tests for new API endpoints
- Unit tests for Home component with mocked API responses
- Test thumbnail placeholder fallback
- Test upload queue integration
