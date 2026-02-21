import { eq, and } from 'drizzle-orm'
import { db } from '../../db'
import { modelConfigs } from '../../db/schema'
import { requireAuth } from '../../utils/getCurrentUser'

export default requireAuth(async (event, user) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, message: 'Model ID is required' })
  }

  await db.delete(modelConfigs).where(
    and(
      eq(modelConfigs.id, id),
      eq(modelConfigs.userId, user.id)
    )
  )
  return { success: true }
})
