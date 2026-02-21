import { eq, and } from 'drizzle-orm'
import { db } from '../../../db'
import { knowledgeBases } from '../../../db/schema'
import { apiHandlerAuth } from '../../../utils/apiHandler'
import { errorResponse, ErrorCodes } from '../../../utils/response'

export default apiHandlerAuth(async (event, user) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    return errorResponse('知识库 ID 不能为空', ErrorCodes.INVALID_PARAMS)
  }

  const kb = await db.query.knowledgeBases.findFirst({
    where: and(
      eq(knowledgeBases.id, id),
      eq(knowledgeBases.userId, user.id)
    ),
    with: { documents: true }
  })

  if (!kb) {
    return errorResponse('知识库不存在', ErrorCodes.NOT_FOUND)
  }

  return kb
})
