import { eq, and } from 'drizzle-orm'
import { db } from '../../db'
import { conversations } from '../../db/schema'
import { requireAuth } from '../../utils/getCurrentUser'

export default requireAuth(async (event, user) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, message: 'Conversation ID is required' })
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
    throw createError({ statusCode: 404, message: 'Conversation not found' })
  }

  return conversation
})
