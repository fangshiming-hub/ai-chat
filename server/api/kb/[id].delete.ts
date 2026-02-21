import { eq, and } from 'drizzle-orm'
import { db } from '../../db'
import { knowledgeBases } from '../../db/schema'
import { vectorStore } from '../../utils/vectorStore'
import { requireAuth } from '../../utils/getCurrentUser'

export default requireAuth(async (event, user) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, message: 'Knowledge base ID is required' })
  }

  // 清理向量存储
  await vectorStore.clearKnowledgeBase(id)

  // 删除数据库记录（只能删除自己的）
  await db.delete(knowledgeBases).where(
    and(
      eq(knowledgeBases.id, id),
      eq(knowledgeBases.userId, user.id)
    )
  )

  return { success: true }
})
