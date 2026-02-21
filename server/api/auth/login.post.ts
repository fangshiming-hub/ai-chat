import { z } from 'zod'
import { db } from '../../db'
import { users } from '../../db/schema'
import { eq } from 'drizzle-orm'
import { verifyPassword, generateToken } from '../../utils/auth'

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
})

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const result = loginSchema.safeParse(body)

    if (!result.success) {
      throw createError({
        statusCode: 400,
        message: result.error.errors[0].message
      })
    }

    const { email, password } = result.data

    // 查找用户
    const user = await db.query.users.findFirst({
      where: eq(users.email, email)
    })

    if (!user) {
      throw createError({
        statusCode: 401,
        message: 'Invalid email or password'
      })
    }

    // 验证密码
    const isValid = await verifyPassword(password, user.passwordHash)

    if (!isValid) {
      throw createError({
        statusCode: 401,
        message: 'Invalid email or password'
      })
    }

    // 生成 JWT Token
    const token = generateToken({
      userId: user.id,
      email: user.email
    })

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      token
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      message: error.message || 'Login failed'
    })
  }
})
