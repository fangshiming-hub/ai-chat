import { vectorStore } from '../../../utils/vectorStore'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, message: 'Knowledge base ID is required' })
  }

  const { query, topK = 5 } = await readBody<{ query: string; topK?: number }>(event)

  if (!query?.trim()) {
    throw createError({ statusCode: 400, message: 'Query is required' })
  }

  try {
    const results = await vectorStore.similaritySearch(id, query, topK)
    return {
      query,
      results: results.map(r => ({
        content: r.content,
        similarity: Math.round(r.similarity * 100) / 100,
        documentName: r.metadata.documentName,
        chunkIndex: r.metadata.chunkIndex
      }))
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: error.message || 'Search failed'
    })
  }
})
