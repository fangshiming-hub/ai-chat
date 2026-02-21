import { z } from 'zod'
import { db } from '../../db'
import { users } from '../../db/schema'
import { eq } from 'drizzle-orm'
import { hashPassword, generateToken } from '../../utils/auth'

const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().optional()
})

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const result = registerSchema.safeParse(body)

    if (!result.success) {
      throw createError({
        statusCode: 400,
        message: result.error.errors[0].message
      })
    }

    const { email, password, name } = result.data

    // 检查邮箱是否已存在
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email)
    })

    if (existingUser) {
      throw createError({
        statusCode: 409,
        message: 'Email already registered'
      })
    }

    // 哈希密码
    const passwordHash = await hashPassword(password)

    // 创建用户
    const [user] = await db.insert(users).values({
      email,
      passwordHash,
      name: name || null
    }).returning({
      id: users.id,
      email: users.email,
      name: users.name
    })

    // 生成 JWT Token
    const token = generateToken({
      userId: user.id,
      email: user.email
    })

    return {
      user,
      token
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      message: error.message || 'Registration failed'
    })
  }
})
