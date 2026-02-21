import { db } from '../../db'
import { conversations } from '../../db/schema'
import { apiHandlerAuth } from '../../utils/apiHandler'

export default apiHandlerAuth(async (event, user) => {
  const body = await readBody(event)
  const [conv] = await db.insert(conversations).values({
    userId: user.id,
    title: body.title || 'New Chat',
    modelId: body.modelId,
    kbIds: body.kbIds || []
  }).returning()
  return conv
})
