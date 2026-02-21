import { desc, eq } from 'drizzle-orm'
import { db } from '../../db'
import { conversations } from '../../db/schema'
import { apiHandlerAuth } from '../../utils/apiHandler'

export default apiHandlerAuth(async (event, user) => {
  const data = await db.query.conversations.findMany({
    where: eq(conversations.userId, user.id),
    orderBy: [desc(conversations.updatedAt)],
    limit: 100
  })
  return data
})
