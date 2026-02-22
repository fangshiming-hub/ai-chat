import { drizzle } from 'drizzle-orm/node-postgres'
import pg from 'pg'
import * as schema from './schema'

const { Pool } = pg

const databaseUrl = process.env.DATABASE_URL

// 开发模式下如果没有数据库 URL，给出友好提示
if (!databaseUrl && process.env.NODE_ENV !== 'production') {
  console.log('')
  console.log('⚠️  DATABASE_URL not set. Starting without database connection.')
  console.log('')
  console.log('To start a local PostgreSQL with Docker:')
  console.log('  docker-compose up -d')
  console.log('')
}

// 创建连接池，使用默认值避免崩溃
const pool = new Pool({
  connectionString: databaseUrl || 'postgresql://localhost:5432/aichat',
  // 连接失败时不终止应用
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
  max: 10
})

// 监听连接错误
pool.on('error', (err) => {
  console.error('Database pool error:', err.message)
})

// 导出 db 实例
export const db = drizzle(pool, { schema })
