import { db } from '../db'
import { users } from '../db/schema'
import { eq } from 'drizzle-orm'
import { getTokenFromHeader, verifyToken } from './auth'

export interface CurrentUser {
  id: string
  email: string
  name: string | null
}

/**
 * 从请求中获取当前登录用户
 */
export async function getCurrentUser(event: any): Promise<CurrentUser | null> {
  try {
    const authHeader = getHeader(event, 'authorization')
    const token = getTokenFromHeader(authHeader)

    if (!token) {
      return null
    }

    const payload = verifyToken(token)

    const user = await db.query.users.findFirst({
      where: eq(users.id, payload.userId),
      columns: {
        id: true,
        email: true,
        name: true
      }
    })

    return user || null
  } catch (error) {
    return null
  }
}

/**
 * 需要登录的处理器包装器
 */
export function requireAuth(handler: (event: any, user: CurrentUser) => Promise<any>) {
  return defineEventHandler(async (event) => {
    const user = await getCurrentUser(event)

    if (!user) {
      throw createError({
        statusCode: 401,
        message: 'Unauthorized'
      })
    }

    return handler(event, user)
  })
}
