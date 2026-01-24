import { drizzle } from 'drizzle-orm/node-postgres'
import pg from 'pg'
import config from '../config.js'
import * as schema from './schema.js'

const { Pool } = pg

const pool = new Pool({
  connectionString: config.databaseUrl,
  // Heroku Postgres requires SSL, but uses self-signed certificates
  ssl: config.isProduction ? { rejectUnauthorized: false } : false,
})

export const db = drizzle(pool, { schema })
export { pool }
