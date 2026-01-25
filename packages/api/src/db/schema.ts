import { bigint, integer, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  authId: uuid('auth_id').unique().notNull(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  displayName: varchar('display_name', { length: 255 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert

export const recordings = pgTable('recordings', {
  id: uuid('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  mimeType: varchar('mime_type', { length: 100 }).notNull(),
  duration: integer('duration').notNull(),
  fileSize: bigint('file_size', { mode: 'number' }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
  videoUrl: varchar('video_url', { length: 500 }).notNull(),
  videoPublicId: varchar('video_public_id', { length: 255 }).notNull(),
  thumbnailUrl: varchar('thumbnail_url', { length: 500 }),
  thumbnailPublicId: varchar('thumbnail_public_id', { length: 255 }),
  userId: uuid('user_id').references(() => users.id),
})

export type Recording = typeof recordings.$inferSelect
export type NewRecording = typeof recordings.$inferInsert

export const recordingShares = pgTable('recording_shares', {
  id: uuid('id').primaryKey().defaultRandom(),
  recordingId: uuid('recording_id')
    .notNull()
    .references(() => recordings.id, { onDelete: 'cascade' }),
  shareToken: varchar('share_token', { length: 64 }).unique().notNull(),
  shareType: varchar('share_type', { length: 20 }).notNull(), // 'link' | 'single_view'
  viewCount: integer('view_count').notNull().default(0),
  maxViews: integer('max_views'), // NULL = unlimited
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  revokedAt: timestamp('revoked_at', { withTimezone: true }),
})

export type RecordingShare = typeof recordingShares.$inferSelect
export type NewRecordingShare = typeof recordingShares.$inferInsert
