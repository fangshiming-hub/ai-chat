import { eq, and } from 'drizzle-orm'
import { db } from '../../../db'
import { modelConfigs } from '../../../db/schema'
import { apiHandlerAuth } from '../../../utils/apiHandler'
import { errorResponse, ErrorCodes } from '../../../utils/response'

export default apiHandlerAuth(async (event, user) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    return errorResponse('模型 ID 不能为空', ErrorCodes.INVALID_PARAMS)
  }

  // 取消该用户的其他默认
  await db.update(modelConfigs)
    .set({ isDefault: 0 })
    .where(
      and(
        eq(modelConfigs.userId, user.id),
        eq(modelConfigs.isDefault, 1)
      )
    )

  // 设置新的默认（只能设置自己的）
  await db.update(modelConfigs)
    .set({ isDefault: 1 })
    .where(
      and(
        eq(modelConfigs.id, id),
        eq(modelConfigs.userId, user.id)
      )
    )

  return { success: true }
})
