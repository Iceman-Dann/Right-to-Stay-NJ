import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema.js'

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  console.warn('DATABASE_URL environment variable is not configured.')
}

const isLocalhost = databaseUrl?.includes('localhost') || databaseUrl?.includes('127.0.0.1')

export const pool = new Pool({
  connectionString: databaseUrl,
  max: 5,
  ssl: isLocalhost ? false : { rejectUnauthorized: false }
})

export const db = drizzle(pool, { schema })
