import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  tablesFilter: ['users', 'recordings', 'recording_shares'],
  dbCredentials: {
    url:
      process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/just_recordings',
  },
})
