import { errorResponse, successResponse, ErrorCodes } from './response'

/**
 * 统一 API 错误处理包装器
 */
export function apiHandler(handler: (event: any) => Promise<any>) {
  return defineEventHandler(async (event) => {
    try {
      const result = await handler(event)
      return successResponse(result)
    } catch (error: any) {
      // 处理 H3 错误
      if (error.statusCode) {
        const statusCode = mapHttpStatusToErrorCode(error.statusCode)
        return errorResponse(error.message || '请求失败', statusCode)
      }

      // 处理数据库错误
      if (error.code?.startsWith('P')) {
        // Prisma 错误码
        return handlePrismaError(error)
      }

      // 未知错误
      console.error('API Error:', error)
      return errorResponse(error.message || '服务器内部错误', ErrorCodes.UNKNOWN_ERROR)
    }
  })
}

/**
 * 需要认证的 API 处理
 */
export function apiHandlerAuth(handler: (event: any, user: any) => Promise<any>) {
  return defineEventHandler(async (event) => {
    try {
      const { getCurrentUser } = await import('./getCurrentUser')
      const user = await getCurrentUser(event)

      if (!user) {
        return errorResponse('请先登录', ErrorCodes.UNAUTHORIZED)
      }

      const result = await handler(event, user)
      return successResponse(result)
    } catch (error: any) {
      // 处理 H3 错误
      if (error.statusCode) {
        const statusCode = mapHttpStatusToErrorCode(error.statusCode)
        return errorResponse(error.message || '请求失败', statusCode)
      }

      // 处理数据库错误
      if (error.code?.startsWith('P')) {
        return handlePrismaError(error)
      }

      // 未知错误
      console.error('API Error:', error)
      return errorResponse(error.message || '服务器内部错误', ErrorCodes.UNKNOWN_ERROR)
    }
  })
}

/**
 * HTTP 状态码映射到自定义错误码
 */
function mapHttpStatusToErrorCode(statusCode: number): number {
  switch (statusCode) {
    case 400:
      return ErrorCodes.INVALID_PARAMS
    case 401:
      return ErrorCodes.UNAUTHORIZED
    case 403:
      return ErrorCodes.FORBIDDEN
    case 404:
      return ErrorCodes.NOT_FOUND
    default:
      return ErrorCodes.UNKNOWN_ERROR
  }
}

/**
 * 处理 Prisma 数据库错误
 */
function handlePrismaError(error: any) {
  switch (error.code) {
    case 'P2002': // 唯一约束冲突
      return errorResponse('数据已存在', ErrorCodes.DB_UNIQUE_VIOLATION)
    case 'P2025': // 记录未找到
      return errorResponse('数据不存在', ErrorCodes.NOT_FOUND)
    default:
      return errorResponse('数据库操作失败', ErrorCodes.DB_ERROR)
  }
}
