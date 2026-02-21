import { eq, and } from 'drizzle-orm'
import { db } from '../../db'
import { conversations } from '../../db/schema'
import { apiHandlerAuth } from '../../utils/apiHandler'
import { errorResponse, ErrorCodes } from '../../utils/response'

export default apiHandlerAuth(async (event, user) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    return errorResponse('对话 ID 不能为空', ErrorCodes.INVALID_PARAMS)
  }

  const conversation = await db.query.conversations.findFirst({
    where: and(
      eq(conversations.id, id),
      eq(conversations.userId, user.id)
    ),
    with: {
      messages: {
        orderBy: (messages, { asc }) => [asc(messages.createdAt)]
      }
    }
  })

  if (!conversation) {
    return errorResponse('对话不存在', ErrorCodes.CONVERSATION_NOT_FOUND)
  }

  return conversation
})
