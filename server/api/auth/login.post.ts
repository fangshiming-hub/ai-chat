import { z } from 'zod'
import { db } from '../../db'
import { users } from '../../db/schema'
import { eq } from 'drizzle-orm'
import { verifyPassword, generateToken } from '../../utils/auth'
import { successResponse, errorResponse, ErrorCodes } from '../../utils/response'

const loginSchema = z.object({
  email: z.string().email('邮箱格式不正确'),
  password: z.string().min(1, '密码不能为空')
})

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const result = loginSchema.safeParse(body)

    if (!result.success) {
      return errorResponse(result.error.errors[0].message, ErrorCodes.INVALID_PARAMS)
    }

    const { email, password } = result.data

    // 查找用户
    const user = await db.query.users.findFirst({
      where: eq(users.email, email)
    })

    if (!user) {
      return errorResponse('邮箱或密码错误', ErrorCodes.AUTH_INVALID_CREDENTIALS)
    }

    // 验证密码
    const isValid = await verifyPassword(password, user.passwordHash)

    if (!isValid) {
      return errorResponse('邮箱或密码错误', ErrorCodes.AUTH_INVALID_CREDENTIALS)
    }

    // 生成 JWT Token
    const token = generateToken({
      userId: user.id,
      email: user.email
    })

    return successResponse({
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      token
    }, '登录成功')
  } catch (error: any) {
    console.error('Login error:', error)
    return errorResponse(error.message || '登录失败', ErrorCodes.UNKNOWN_ERROR)
  }
})
