import { eq, and } from 'drizzle-orm'
import { db } from '../../db'
import { modelConfigs } from '../../db/schema'
import { apiHandlerAuth } from '../../utils/apiHandler'
import { errorResponse, ErrorCodes } from '../../utils/response'

export default apiHandlerAuth(async (event, user) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    return errorResponse('模型 ID 不能为空', ErrorCodes.INVALID_PARAMS)
  }

  await db.delete(modelConfigs).where(
    and(
      eq(modelConfigs.id, id),
      eq(modelConfigs.userId, user.id)
    )
  )
  return { success: true }
})
