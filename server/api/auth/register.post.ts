import { z } from 'zod'
import { db } from '../../db'
import { users } from '../../db/schema'
import { eq } from 'drizzle-orm'
import { hashPassword, generateToken } from '../../utils/auth'
import { successResponse, errorResponse, ErrorCodes } from '../../utils/response'

const registerSchema = z.object({
  email: z.string().email('邮箱格式不正确'),
  password: z.string().min(6, '密码至少6位'),
  name: z.string().optional()
})

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const result = registerSchema.safeParse(body)

    if (!result.success) {
      return errorResponse(result.error.errors[0].message, ErrorCodes.INVALID_PARAMS)
    }

    const { email, password, name } = result.data

    // 检查邮箱是否已存在
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email)
    })

    if (existingUser) {
      return errorResponse('该邮箱已被注册', ErrorCodes.AUTH_EMAIL_EXISTS)
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

    return successResponse({
      user,
      token
    }, '注册成功')
  } catch (error: any) {
    console.error('Register error:', error)
    return errorResponse(error.message || '注册失败', ErrorCodes.UNKNOWN_ERROR)
  }
})
