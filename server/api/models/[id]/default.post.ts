import { eq, and } from 'drizzle-orm'
import { db } from '../../../db'
import { modelConfigs } from '../../../db/schema'
import { requireAuth } from '../../../utils/getCurrentUser'

export default requireAuth(async (event, user) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, message: 'Model ID is required' })
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
