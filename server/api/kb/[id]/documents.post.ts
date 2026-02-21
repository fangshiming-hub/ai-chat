import { eq, and } from 'drizzle-orm'
import { db } from '../../../db'
import { documents, vectorChunks, knowledgeBases } from '../../../db/schema'
import { extractText, splitTextIntoChunks } from '../../../utils/documents'
import { vectorStore } from '../../../utils/vectorStore'
import { apiHandlerAuth } from '../../../utils/apiHandler'
import { errorResponse, ErrorCodes } from '../../../utils/response'

export default apiHandlerAuth(async (event, user) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    return errorResponse('知识库 ID 不能为空', ErrorCodes.INVALID_PARAMS)
  }

  // 验证知识库属于当前用户
  const kb = await db.query.knowledgeBases.findFirst({
    where: and(
      eq(knowledgeBases.id, id),
      eq(knowledgeBases.userId, user.id)
    )
  })

  if (!kb) {
    return errorResponse('知识库不存在或无权访问', ErrorCodes.FORBIDDEN)
  }

  const formData = await readMultipartFormData(event)
  if (!formData || !formData[0]) {
    return errorResponse('请上传文件', ErrorCodes.INVALID_PARAMS)
  }

  const file = formData[0]
  const ext = file.filename?.split('.').pop()?.toLowerCase() || ''

  if (!['pdf', 'docx', 'txt', 'md'].includes(ext)) {
    return errorResponse('不支持的文件类型，请上传 PDF、DOCX、TXT 或 Markdown 文件', ErrorCodes.FILE_TYPE_UNSUPPORTED)
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
    console.error('Document upload error:', error)
    return errorResponse(error.message || '文档处理失败', ErrorCodes.FILE_PARSE_ERROR)
  }
})
