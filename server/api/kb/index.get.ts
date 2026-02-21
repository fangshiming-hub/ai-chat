import { eq } from 'drizzle-orm'
import { db } from '../../db'
import { knowledgeBases } from '../../db/schema'
import { apiHandlerAuth } from '../../utils/apiHandler'

export default apiHandlerAuth(async (event, user) => {
  const data = await db.query.knowledgeBases.findMany({
    where: eq(knowledgeBases.userId, user.id),
    orderBy: (knowledgeBases, { desc }) => [desc(knowledgeBases.createdAt)]
  })
  return data
})
