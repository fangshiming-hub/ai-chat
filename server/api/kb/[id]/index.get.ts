import { eq } from 'drizzle-orm'
import { db } from '../../../db'
import { knowledgeBases } from '../../../db/schema'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, message: 'Knowledge base ID is required' })
  }

  const kb = await db.query.knowledgeBases.findFirst({
    where: eq(knowledgeBases.id, id),
    with: { documents: true }
  })

  if (!kb) throw createError({ statusCode: 404, message: 'Not found' })
  return kb
})
