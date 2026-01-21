# Desktop Authentication & Backend Authorization

## Overview

This design covers three main objectives:
1. Share authentication UI/logic between web and desktop apps
2. Add authentication to the desktop app (recording requires login)
3. Add backend authorization guards to ensure users can only CRUD their own recordings

## Current State

### Web App Authentication
- Login, Signup, Password Reset pages exist in `packages/web/src/pages/`
- Supabase client and auth functions in `packages/web/src/services/supabase.ts`
- Validation schemas in `packages/web/src/utils/auth.ts`
- Auth state managed via Zustand store

### Desktop App
- No authentication - records and uploads anonymously
- Single Recording page with no auth guards
- Uses `@just-recordings/recorder` package for recording/uploading

### Backend
- `requireAuth` middleware exists but only used on `/api/users/me`
- Recording endpoints (`/api/recordings/*`) have NO authentication
- Upload endpoints (`/api/dev/upload/*`) have NO authentication
- Recordings table has no `userId` column - recordings are global

### Recording ID Generation
- **Note**: Recording IDs are already generated server-side in `upload.ts:106` using `randomUUID()`. The `uploadId` is also generated server-side. No changes needed here.

## Proposed Changes

### 1. Shared Auth Package

Move authentication logic to the shared package so both web and desktop can use it:

**New files in `packages/shared/src/auth/`:**
- `client.ts` - Supabase client initialization (configurable URL/key)
- `service.ts` - Auth functions (login, signup, logout, resetPassword, updatePassword, getUser, getToken)
- `validation.ts` - Zod schemas for email, password, signup validation

**Update web app** to import from `@just-recordings/shared/auth` instead of local files.

### 2. Auth-Aware Uploading

The recorder package uploaders need to support passing an auth token:

**Changes to `packages/recorder/src/`:**
- Update `createUploader()` to accept optional auth token getter
- Update `DevUploader` to include `Authorization: Bearer <token>` header
- Update uploader interface types

**Update web app** to pass token getter when creating uploader.

### 3. Backend Authorization

Add user ownership to recordings:

**Database schema changes:**
- Add `userId` column (UUID, foreign key to users.id) to recordings table
- Make it NOT NULL for new recordings
- Create migration

**Endpoint authorization:**
- Add `requireAuth` to all `/api/recordings/*` endpoints
- Add `requireAuth` to all `/api/dev/upload/*` endpoints
- Filter `GET /api/recordings` by `req.user.id`
- Validate ownership on `GET /api/recordings/:id`, `DELETE /api/recordings/:id`
- Set `userId` when saving recording metadata in upload finalize

### 4. Desktop Authentication

Add full authentication flow to desktop app:

**Configuration:**
- Add Supabase URL/key to desktop app config
- Create Supabase client instance

**State management:**
- Create auth store/context for desktop (similar pattern to web's Zustand store)
- Track: `authUser`, `appUser`, `loadingUser`, `isAuthenticated`

**Auth pages:**
- Login page - email/password form
- Signup page - email/password/confirm form
- Password Reset page - two-phase (request reset / set new password)

**Routing:**
- If not authenticated: show Login page (with links to Signup/Reset)
- If authenticated: show Recording page
- Add Logout functionality (in menu or UI)

**Integration:**
- Pass auth token to uploader when creating it
- Uploader includes token in upload requests

## API Changes

### Recording Endpoints (all require auth)

```
GET /api/recordings
- Returns only recordings where userId = authenticated user's id

GET /api/recordings/:id
- Returns 404 if recording doesn't exist OR doesn't belong to user

GET /api/recordings/:id/video
- Returns 404 if recording doesn't exist OR doesn't belong to user

GET /api/recordings/:id/thumbnail
- Returns 404 if recording doesn't exist OR doesn't belong to user

DELETE /api/recordings/:id
- Returns 404 if recording doesn't exist OR doesn't belong to user
```

### Upload Endpoints (all require auth)

```
POST /api/dev/upload/start
- Requires auth, stores userId in upload session (or just validates auth)

POST /api/dev/upload/:uploadId/chunk
- Requires auth

POST /api/dev/upload/:uploadId/finalize
- Requires auth
- Saves userId with recording metadata
```

## Database Migration

```sql
ALTER TABLE recordings
ADD COLUMN user_id UUID REFERENCES users(id);

-- For existing recordings, they'll have NULL userId
-- New recordings will require userId
```

## Security Considerations

- All recording endpoints protected by auth middleware
- Ownership validation prevents accessing other users' recordings
- Auth tokens passed via Authorization header (Bearer token)
- Supabase handles token validation via `getUser(token)`
