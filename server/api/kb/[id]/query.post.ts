import { eq, and } from 'drizzle-orm'
import { db } from '../../../db'
import { knowledgeBases } from '../../../db/schema'
import { vectorStore } from '../../../utils/vectorStore'
import { apiHandlerAuth } from '../../../utils/apiHandler'
import { errorResponse, ErrorCodes } from '../../../utils/response'

export default apiHandlerAuth(async (event, user) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    return errorResponse('知识库 ID 不能为空', ErrorCodes.INVALID_PARAMS)
  }

  // 验证知识库属于当前用户
  const kb = await db.query.knowledgeBases.findFirst({
    where: and(
      eq(knowledgeBases.id, id),
      eq(knowledgeBases.userId, user.id)
    )
  })

  if (!kb) {
    return errorResponse('知识库不存在或无权访问', ErrorCodes.FORBIDDEN)
  }

  const { query, topK = 5 } = await readBody<{ query: string; topK?: number }>(event)

  if (!query?.trim()) {
    return errorResponse('查询内容不能为空', ErrorCodes.INVALID_PARAMS)
  }

  try {
    const results = await vectorStore.similaritySearch(id, query, topK)
    return {
      query,
      results: results.map(r => ({
        content: r.content,
        similarity: Math.round(r.similarity * 100) / 100,
        documentName: r.metadata.documentName,
        chunkIndex: r.metadata.chunkIndex
      }))
    }
  } catch (error: any) {
    console.error('Knowledge base query error:', error)
    return errorResponse(error.message || '搜索失败', ErrorCodes.UNKNOWN_ERROR)
  }
})
