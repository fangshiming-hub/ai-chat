import { desc, eq } from 'drizzle-orm'
import { db } from '../../db'
import { conversations } from '../../db/schema'
import { requireAuth } from '../../utils/getCurrentUser'

export default requireAuth(async (event, user) => {
  const data = await db.query.conversations.findMany({
    where: eq(conversations.userId, user.id),
    orderBy: [desc(conversations.updatedAt)],
    limit: 100
  })
  return data
})
