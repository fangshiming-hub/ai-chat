import { eq } from 'drizzle-orm'
import { db } from '../../db'
import { modelConfigs } from '../../db/schema'
import { apiHandlerAuth } from '../../utils/apiHandler'

export default apiHandlerAuth(async (event, user) => {
  const data = await db.query.modelConfigs.findMany({
    where: eq(modelConfigs.userId, user.id),
    orderBy: (modelConfigs, { desc }) => [desc(modelConfigs.createdAt)]
  })
  return data
})
