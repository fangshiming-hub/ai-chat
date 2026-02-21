import { db } from '../../db'
import { knowledgeBases } from '../../db/schema'
import { requireAuth } from '../../utils/getCurrentUser'

export default requireAuth(async (event, user) => {
  const body = await readBody(event)

  const [data] = await db.insert(knowledgeBases).values({
    userId: user.id,
    name: body.name,
    description: body.description,
    embeddingModel: body.embeddingModel || 'text-embedding-3-small'
  }).returning()

  return data
})
