import { eq, and } from 'drizzle-orm'
import { db } from '../../db'
import { knowledgeBases } from '../../db/schema'
import { vectorStore } from '../../utils/vectorStore'
import { apiHandlerAuth } from '../../utils/apiHandler'
import { errorResponse, ErrorCodes } from '../../utils/response'

export default apiHandlerAuth(async (event, user) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    return errorResponse('知识库 ID 不能为空', ErrorCodes.INVALID_PARAMS)
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
