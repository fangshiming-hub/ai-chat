import { eq, and } from 'drizzle-orm'
import { db } from '../../db'
import { conversations } from '../../db/schema'
import { requireAuth } from '../../utils/getCurrentUser'

export default requireAuth(async (event, user) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, message: 'Conversation ID is required' })
  }

  await db.delete(conversations).where(
    and(
      eq(conversations.id, id),
      eq(conversations.userId, user.id)
    )
  )
  return { success: true }
})
