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
  path: varchar('path', { length: 500 }).notNull(),
  thumbnailPath: varchar('thumbnail_path', { length: 500 }),
  userId: uuid('user_id').references(() => users.id),
})

export type Recording = typeof recordings.$inferSelect
export type NewRecording = typeof recordings.$inferInsert
