import { eq, and } from 'drizzle-orm'
import { db } from '../../db'
import { modelConfigs } from '../../db/schema'
import { apiHandlerAuth } from '../../utils/apiHandler'
import { errorResponse, ErrorCodes } from '../../utils/response'

export default apiHandlerAuth(async (event, user) => {
  const body = await readBody(event)

  // 验证必填字段
  if (!body.name || !body.provider || !body.apiKey || !body.model) {
    return errorResponse('请填写所有必填字段', ErrorCodes.INVALID_PARAMS)
  }

  // 如果设置为默认，取消该用户的其他默认
  if (body.isDefault) {
    await db.update(modelConfigs)
      .set({ isDefault: 0 })
      .where(
        and(
          eq(modelConfigs.userId, user.id),
          eq(modelConfigs.isDefault, 1)
        )
      )
  }

  const [data] = await db.insert(modelConfigs).values({
    userId: user.id,
    name: body.name,
    provider: body.provider,
    baseUrl: body.baseUrl,
    apiKey: body.apiKey,
    model: body.model,
    maxTokens: body.maxTokens,
    temperature: body.temperature,
    isDefault: body.isDefault ? 1 : 0
  }).returning()

  return data
})
