import { eq } from 'drizzle-orm'
import { db } from '../../db'
import { knowledgeBases } from '../../db/schema'
import { requireAuth } from '../../utils/getCurrentUser'

export default requireAuth(async (event, user) => {
  const data = await db.query.knowledgeBases.findMany({
    where: eq(knowledgeBases.userId, user.id),
    orderBy: (knowledgeBases, { desc }) => [desc(knowledgeBases.createdAt)]
  })
  return data
})
