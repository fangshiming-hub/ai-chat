import { drizzle } from 'drizzle-orm/node-postgres'
import pg from 'pg'
import * as schema from './schema'

const { Pool } = pg

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  console.warn('Warning: DATABASE_URL is not set. Database operations will fail.')
}

const pool = new Pool({
  connectionString: databaseUrl || 'postgresql://localhost:5432/aichat'
})

// 监听连接错误
pool.on('error', (err) => {
  console.error('Unexpected database pool error:', err)
})

export const db = drizzle(pool, { schema })
