import { eq } from 'drizzle-orm'
import { db } from '../../../db'
import { documents, vectorChunks } from '../../../db/schema'
import { extractText, splitTextIntoChunks } from '../../../utils/documents'
import { vectorStore } from '../../../utils/vectorStore'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, message: 'Knowledge base ID is required' })
  }

  const formData = await readMultipartFormData(event)
  if (!formData || !formData[0]) {
    throw createError({ statusCode: 400, message: 'No file uploaded' })
  }

  const file = formData[0]
  const ext = file.filename?.split('.').pop()?.toLowerCase() || ''

  if (!['pdf', 'docx', 'txt', 'md'].includes(ext)) {
    throw createError({ statusCode: 400, message: 'Unsupported file type' })
  }

  try {
    // 提取文本
    const content = await extractText(Buffer.from(file.data), ext)

    // 保存文档
    const [doc] = await db.insert(documents).values({
      kbId: id,
      name: file.filename || 'untitled',
      content: content.slice(0, 100000), // 限制存储大小
      fileType: ext as any,
      fileSize: file.data.length
    }).returning()

    // 分块
    const chunks = splitTextIntoChunks(content)

    // 保存分块到数据库
    const chunkIds: string[] = []
    for (let i = 0; i < chunks.length; i++) {
      const [chunk] = await db.insert(vectorChunks).values({
        documentId: doc.id,
        kbId: id,
        content: chunks[i],
        chunkIndex: i,
        metadata: {
          documentName: file.filename,
          chunkIndex: i,
          totalChunks: chunks.length
        }
      }).returning()
      chunkIds.push(chunk.id)
    }

    // 同步到向量存储
    const vectorDocs = chunks.map((chunk, i) => ({
      id: chunkIds[i],
      content: chunk,
      metadata: {
        documentId: doc.id,
        documentName: file.filename,
        chunkIndex: i,
        totalChunks: chunks.length
      }
    }))
    await vectorStore.addDocuments(id, vectorDocs)

    return {
      document: doc,
      chunksCount: chunks.length
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to process document'
    })
  }
})
