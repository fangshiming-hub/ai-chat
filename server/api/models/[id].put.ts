import { eq, and } from 'drizzle-orm'
import { db } from '../../db'
import { modelConfigs } from '../../db/schema'
import { apiHandlerAuth } from '../../utils/apiHandler'
import { errorResponse, ErrorCodes, successResponse } from '../../utils/response'

export default apiHandlerAuth(async (event, user) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    return errorResponse('缺少模型ID', ErrorCodes.INVALID_PARAMS)
  }

  const body = await readBody(event)

  // 验证必填字段
  if (!body.name || !body.provider || !body.apiKey || !body.model) {
    return errorResponse('请填写所有必填字段', ErrorCodes.INVALID_PARAMS)
  }

  // 检查模型是否存在且属于当前用户
  const existing = await db.query.modelConfigs.findFirst({
    where: and(
      eq(modelConfigs.id, id),
      eq(modelConfigs.userId, user.id)
    )
  })

  if (!existing) {
    return errorResponse('模型不存在', ErrorCodes.NOT_FOUND)
  }

  // 如果设置为默认，取消该用户的其他默认
  if (body.isDefault && !existing.isDefault) {
    await db.update(modelConfigs)
      .set({ isDefault: 0 })
      .where(
        and(
          eq(modelConfigs.userId, user.id),
          eq(modelConfigs.isDefault, 1)
        )
      )
  }

  const [data] = await db.update(modelConfigs)
    .set({
      name: body.name,
      provider: body.provider,
      baseUrl: body.baseUrl,
      apiKey: body.apiKey,
      model: body.model,
      maxTokens: body.maxTokens,
      temperature: body.temperature,
      isDefault: body.isDefault ? 1 : 0
    })
    .where(eq(modelConfigs.id, id))
    .returning()

  return successResponse(data, '更新成功')
})
