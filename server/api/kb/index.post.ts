import { db } from '../../db'
import { knowledgeBases } from '../../db/schema'
import { apiHandlerAuth } from '../../utils/apiHandler'
import { errorResponse, ErrorCodes } from '../../utils/response'

export default apiHandlerAuth(async (event, user) => {
  const body = await readBody(event)

  if (!body.name) {
    return errorResponse('知识库名称不能为空', ErrorCodes.INVALID_PARAMS)
  }

  const [data] = await db.insert(knowledgeBases).values({
    userId: user.id,
    name: body.name,
    description: body.description,
    embeddingModel: body.embeddingModel || 'text-embedding-3-small'
  }).returning()

  return data
})
