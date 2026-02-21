/**
 * API 统一响应格式
 * statusCode: 0 表示成功，非 0 表示错误
 * msg: 提示信息
 * data: 返回数据
 */

export interface ApiResponse<T = any> {
  statusCode: number
  msg: string
  data: T | null
}

/**
 * 成功响应
 */
export function successResponse<T>(data: T, msg: string = 'success'): ApiResponse<T> {
  return {
    statusCode: 0,
    msg,
    data
  }
}

/**
 * 错误响应
 */
export function errorResponse(msg: string, statusCode: number = 1, data: any = null): ApiResponse {
  return {
    statusCode,
    msg,
    data
  }
}

/**
 * 常见错误码定义
 */
export const ErrorCodes = {
  // 通用错误 1-99
  UNKNOWN_ERROR: 1,
  INVALID_PARAMS: 2,
  UNAUTHORIZED: 3,
  FORBIDDEN: 4,
  NOT_FOUND: 5,

  // 认证错误 100-199
  AUTH_INVALID_CREDENTIALS: 100,
  AUTH_TOKEN_EXPIRED: 101,
  AUTH_TOKEN_INVALID: 102,
  AUTH_EMAIL_EXISTS: 103,
  AUTH_EMAIL_NOT_FOUND: 104,
  AUTH_WRONG_PASSWORD: 105,

  // 业务错误 200-299
  MODEL_NOT_FOUND: 200,
  MODEL_NO_DEFAULT: 201,
  KB_NOT_FOUND: 210,
  CONVERSATION_NOT_FOUND: 220,
  CHAT_NO_MODEL: 230,
  CHAT_STREAM_ERROR: 231,

  // 文件错误 300-399
  FILE_UPLOAD_FAILED: 300,
  FILE_TYPE_UNSUPPORTED: 301,
  FILE_TOO_LARGE: 302,
  FILE_PARSE_ERROR: 303,

  // 数据库错误 400-499
  DB_ERROR: 400,
  DB_UNIQUE_VIOLATION: 401,
} as const
