# PostgreSQL Migration

## Overview

Migrate the API backend from JSON file-based metadata storage to PostgreSQL database running in Docker.

## Current State

The API stores recording metadata in a JSON file (`uploads/metadata.json`). All CRUD operations read/write to this file:
- `readMetadata()` - reads entire JSON file
- `writeMetadata()` - writes entire JSON file
- `saveRecordingMetadata()` - adds/updates a recording

### Current Data Model

```typescript
interface RecordingMetadata {
  id: string;           // UUID
  name: string;
  mimeType: string;
  duration: number;     // milliseconds
  fileSize: number;     // bytes
  createdAt: string;    // ISO timestamp
  path: string;
  thumbnailPath?: string;
}
```

### Files That Access Metadata

1. `packages/api/src/routes/recordings.ts` - All CRUD operations
2. `packages/api/src/routes/upload.ts` - Calls `saveRecordingMetadata()` on finalize

## Design

### Docker Setup

Create a `docker-compose.yml` at the repository root:

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: just_recordings
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### Database Schema

Single `recordings` table:

```sql
CREATE TABLE recordings (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  duration INTEGER NOT NULL,
  file_size BIGINT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL,
  path VARCHAR(500) NOT NULL,
  thumbnail_path VARCHAR(500)
);

CREATE INDEX idx_recordings_created_at ON recordings(created_at DESC);
```

### Database Client (Drizzle ORM)

Use Drizzle ORM for type-safe database operations.

**Schema definition:**
```typescript
// packages/api/src/db/schema.ts
import { pgTable, uuid, varchar, integer, bigint, timestamp } from 'drizzle-orm/pg-core';

export const recordings = pgTable('recordings', {
  id: uuid('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  mimeType: varchar('mime_type', { length: 100 }).notNull(),
  duration: integer('duration').notNull(),
  fileSize: bigint('file_size', { mode: 'number' }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
  path: varchar('path', { length: 500 }).notNull(),
  thumbnailPath: varchar('thumbnail_path', { length: 500 }),
});
```

**Database connection:**
```typescript
// packages/api/src/db/index.ts
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/just_recordings'
});

export const db = drizzle(pool, { schema });
```

### Repository Pattern

Create a repository module using Drizzle queries:

```typescript
// packages/api/src/repositories/recordings.ts
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { recordings } from '../db/schema';

export async function getAllRecordings() {
  return db.select().from(recordings).orderBy(recordings.createdAt);
}

export async function getRecordingById(id: string) {
  const result = await db.select().from(recordings).where(eq(recordings.id, id));
  return result[0] || null;
}

export async function saveRecording(recording: RecordingMetadata) {
  await db.insert(recordings).values({...});
}

export async function deleteRecording(id: string) {
  await db.delete(recordings).where(eq(recordings.id, id));
}
```

### Migration Strategy

1. Create new database module and repository
2. Update routes to use repository instead of JSON file functions
3. Remove JSON file helper functions
4. Add database initialization on startup

### Environment Variables

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/just_recordings
```

### Testing

Tests will use a separate test database or mock the repository layer. The existing test patterns with supertest can continue to work.

## File Changes

### New Files
- `docker-compose.yml` - PostgreSQL container
- `packages/api/src/db/index.ts` - Drizzle database connection
- `packages/api/src/db/schema.ts` - Drizzle schema definition
- `packages/api/src/repositories/recordings.ts` - Recording CRUD operations
- `packages/api/drizzle.config.ts` - Drizzle Kit configuration

### Modified Files
- `packages/api/src/routes/recordings.ts` - Use repository instead of JSON functions
- `packages/api/src/routes/upload.ts` - Use repository for saving metadata
- `packages/api/package.json` - Add `drizzle-orm`, `drizzle-kit`, `pg` dependencies
- `packages/api/.env.example` - Add DATABASE_URL

### Removed
- JSON file helper functions (`readMetadata`, `writeMetadata`)
- `uploads/metadata.json` dependency (file can be deleted after migration)

## Development Workflow

1. Start database: `docker-compose up -d`
2. Run API: `npm run dev` (in packages/api)
3. Stop database: `docker-compose down`
4. Reset database: `docker-compose down -v` (removes data volume)
