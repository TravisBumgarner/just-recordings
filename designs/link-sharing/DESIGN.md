# Link Sharing Design

## Overview

Add the ability for users to share recordings via links with configurable access levels. Users can create share links, manage existing shares, and revoke access at any time.

## Sharing Options

Three sharing modes are available:

1. **Just Me** (default) - Recording is private, only the owner can view
2. **Anybody with Link** - Anyone with the share URL can view the recording indefinitely
3. **Single View** - Link expires after being viewed once (burn-after-reading)

## Database Schema

### New Table: `recording_shares`

```sql
CREATE TABLE recording_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recording_id UUID NOT NULL REFERENCES recordings(id) ON DELETE CASCADE,
  share_token VARCHAR(64) UNIQUE NOT NULL,
  share_type VARCHAR(20) NOT NULL, -- 'link' | 'single_view'
  view_count INTEGER NOT NULL DEFAULT 0,
  max_views INTEGER, -- NULL for unlimited, 1 for single_view
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE, -- Optional expiration
  revoked_at TIMESTAMP WITH TIME ZONE -- NULL if active, set when revoked
);

CREATE INDEX idx_recording_shares_token ON recording_shares(share_token);
CREATE INDEX idx_recording_shares_recording ON recording_shares(recording_id);
```

### Drizzle Schema

```typescript
export const recordingShares = pgTable('recording_shares', {
  id: uuid('id').primaryKey().defaultRandom(),
  recordingId: uuid('recording_id').notNull().references(() => recordings.id, { onDelete: 'cascade' }),
  shareToken: varchar('share_token', { length: 64 }).unique().notNull(),
  shareType: varchar('share_type', { length: 20 }).notNull(), // 'link' | 'single_view'
  viewCount: integer('view_count').notNull().default(0),
  maxViews: integer('max_views'), // NULL = unlimited
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  revokedAt: timestamp('revoked_at', { withTimezone: true }),
})
```

## API Endpoints

### Authenticated Endpoints (for recording owners)

#### POST /api/recordings/:id/shares
Create a new share link for a recording.

**Request:**
```json
{
  "shareType": "link" | "single_view"
}
```

**Response:**
```json
{
  "success": true,
  "share": {
    "id": "uuid",
    "shareToken": "abc123...",
    "shareType": "link",
    "shareUrl": "https://app.example.com/share/abc123...",
    "viewCount": 0,
    "maxViews": null,
    "createdAt": "2026-01-24T...",
    "expiresAt": null
  }
}
```

#### GET /api/recordings/:id/shares
List all shares for a recording (active and revoked).

**Response:**
```json
{
  "success": true,
  "shares": [
    {
      "id": "uuid",
      "shareToken": "abc123...",
      "shareType": "link",
      "shareUrl": "https://app.example.com/share/abc123...",
      "viewCount": 5,
      "maxViews": null,
      "createdAt": "2026-01-24T...",
      "expiresAt": null,
      "revokedAt": null,
      "isActive": true
    }
  ]
}
```

#### DELETE /api/recordings/:id/shares/:shareId
Revoke a share (soft delete - sets revokedAt).

**Response:**
```json
{
  "success": true
}
```

### Public Endpoints (no auth required)

#### GET /api/share/:token
Get recording metadata for a share link.

**Response (valid share):**
```json
{
  "success": true,
  "recording": {
    "id": "uuid",
    "name": "Recording Name",
    "duration": 45000,
    "createdAt": "2026-01-24T..."
  }
}
```

**Response (invalid/expired/revoked):**
```json
{
  "success": false,
  "errorCode": "SHARE_NOT_FOUND" | "SHARE_EXPIRED" | "SHARE_REVOKED" | "SHARE_VIEW_LIMIT_REACHED"
}
```

#### GET /api/share/:token/video
Stream the video file. Increments view count. For single_view shares, marks as consumed after streaming starts.

#### GET /api/share/:token/thumbnail
Get the thumbnail image (if available).

## Share Token Generation

Use crypto-secure random tokens:
```typescript
import { randomBytes } from 'crypto'

function generateShareToken(): string {
  return randomBytes(32).toString('base64url') // 43 characters, URL-safe
}
```

## Share URL Format

```
https://justrecordings.com/share/{token}
```

The `/share/:token` route is a public page that:
1. Fetches recording metadata via `GET /api/share/:token`
2. Displays a simple video player
3. Loads video from `GET /api/share/:token/video`

## UI Components

### ShareModal Component

Displayed when user clicks "Share" on a recording:

```
┌─────────────────────────────────────────────────┐
│ Share "Recording 2026-01-24"               [X]  │
├─────────────────────────────────────────────────┤
│                                                 │
│  Access Level:                                  │
│  ○ Just me (private)                            │
│  ● Anybody with link                            │
│  ○ Single view (link expires after one view)   │
│                                                 │
│  ─────────────────────────────────────────────  │
│                                                 │
│  Share Link:                                    │
│  ┌─────────────────────────────────────┐ [Copy] │
│  │ https://justrecordings.com/share/...│        │
│  └─────────────────────────────────────┘        │
│                                                 │
│  ─────────────────────────────────────────────  │
│                                                 │
│  Active Shares:                                 │
│  • Anybody with link - 5 views    [Revoke]     │
│  • Single view - expired          [Remove]     │
│                                                 │
└─────────────────────────────────────────────────┘
```

### SharedRecordingViewer Page

A public page at `/share/:token` that displays:
- Recording name
- Video player
- Simple, minimal UI (no navigation, no auth required)
- Error states for invalid/expired/revoked shares

## Access Control Logic

```typescript
async function validateShare(token: string): Promise<ShareValidation> {
  const share = await getShareByToken(token)

  if (!share) {
    return { valid: false, error: 'SHARE_NOT_FOUND' }
  }

  if (share.revokedAt) {
    return { valid: false, error: 'SHARE_REVOKED' }
  }

  if (share.expiresAt && share.expiresAt < new Date()) {
    return { valid: false, error: 'SHARE_EXPIRED' }
  }

  if (share.maxViews && share.viewCount >= share.maxViews) {
    return { valid: false, error: 'SHARE_VIEW_LIMIT_REACHED' }
  }

  return { valid: true, share }
}
```

## Recording Deletion

When a recording is deleted:
- All associated shares are automatically deleted (CASCADE)
- Share links become invalid (404)

## Dependencies

1. Database migration must be done first
2. API endpoints for shares depend on the schema
3. Public share viewer depends on the public API endpoints
4. ShareModal depends on the authenticated API endpoints
5. Integration into RecordingViewer depends on ShareModal

## Security Considerations

- Share tokens are cryptographically random (32 bytes = 256 bits of entropy)
- Tokens are URL-safe (base64url encoding)
- Video URLs are not exposed directly - always proxied through API
- Rate limiting on public endpoints to prevent brute force
- View count incremented atomically to prevent race conditions
