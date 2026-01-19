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

export type Recording = typeof recordings.$inferSelect;
export type NewRecording = typeof recordings.$inferInsert;
