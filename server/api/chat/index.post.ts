import { streamText } from 'ai'
import { eq, and } from 'drizzle-orm'
import { db } from '../../db'
import { modelConfigs, messages, conversations } from '../../db/schema'
import { createModel } from '../../utils/ai'
import { vectorStore } from '../../utils/vectorStore'
import { errorResponse, ErrorCodes } from '../../utils/response'
import { getCurrentUser } from '../../utils/getCurrentUser'
import type { ChatRequest } from '~/types'

export default defineEventHandler(async (event) => {
  try {
    // 验证用户
    const user = await getCurrentUser(event)
    if (!user) {
      return errorResponse('请先登录', ErrorCodes.UNAUTHORIZED)
    }

    const body = await readBody<ChatRequest>(event)
    const { message, conversationId, modelId, kbIds } = body

    if (!message?.trim()) {
      return errorResponse('消息内容不能为空', ErrorCodes.INVALID_PARAMS)
    }

    // 获取或创建对话
    let convId = conversationId
    if (!convId) {
      const [newConv] = await db.insert(conversations).values({
        userId: user.id,
        title: message.slice(0, 50) + (message.length > 50 ? '...' : '')
      }).returning({ id: conversations.id })
      convId = newConv.id
    } else {
      // 验证对话属于当前用户
      const conv = await db.query.conversations.findFirst({
        where: and(
          eq(conversations.id, convId),
          eq(conversations.userId, user.id)
        )
      })
      if (!conv) {
        return errorResponse('无权访问该对话', ErrorCodes.FORBIDDEN)
      }
    }

    // 保存用户消息
    await db.insert(messages).values({
      conversationId: convId,
      role: 'user',
      content: message
    })

    // 获取历史消息（最近20条）
    const history = await db.query.messages.findMany({
      where: eq(messages.conversationId, convId),
      orderBy: (messages, { asc }) => [asc(messages.createdAt)],
      limit: 20
    })

    // 获取模型配置（只能使用自己的模型）
    let modelConfig
    if (modelId) {
      modelConfig = await db.query.modelConfigs.findFirst({
        where: and(
          eq(modelConfigs.id, modelId),
          eq(modelConfigs.userId, user.id)
        )
      })
    } else {
      // 使用默认模型
      modelConfig = await db.query.modelConfigs.findFirst({
        where: and(
          eq(modelConfigs.userId, user.id),
          eq(modelConfigs.isDefault, 1)
        )
      })
    }

    if (!modelConfig) {
      return errorResponse('请先配置 AI 模型', ErrorCodes.CHAT_NO_MODEL)
    }

    // RAG 检索：如果有知识库，检索相关内容
    let context = ''
    let sources: any[] = []
    if (kbIds?.length) {
      const allResults: Array<{ content: string; similarity: number; metadata: any }> = []

      for (const kbId of kbIds) {
        const results = await vectorStore.similaritySearch(kbId, message, 3)
        allResults.push(...results)
      }

      // 按相似度排序并取前5个
      allResults.sort((a, b) => b.similarity - a.similarity)
      const topResults = allResults.slice(0, 5)

      if (topResults.length > 0) {
        context = topResults.map((r, i) => `[${i + 1}] ${r.content}`).join('\n\n')
        sources = topResults.map(r => ({
          documentName: r.metadata.documentName,
          chunkIndex: r.metadata.chunkIndex,
          similarity: r.similarity
        }))
      }
    }

    // 构建消息数组
    const chatMessages = history.map(m => ({
      role: m.role,
      content: m.content
    }))

    // 构建 system prompt
    let systemPrompt = undefined
    if (context) {
      systemPrompt = `基于以下参考信息回答问题。如果参考信息不足以回答问题，请明确说明。

参考信息：
${context}

请根据以上信息回答用户问题。引用来源时，请使用 [1], [2] 等标记。`
    }

    // 流式生成
    const result = await streamText({
      model: createModel(modelConfig),
      system: systemPrompt,
      messages: chatMessages,
      maxTokens: modelConfig.maxTokens || undefined,
      temperature: modelConfig.temperature || undefined
    })

    // 读取完整响应并保存
    const fullResponse = await result.text

    // 保存AI回复（包含来源）
    await db.insert(messages).values({
      conversationId: convId,
      role: 'assistant',
      content: fullResponse,
      sources: sources.length > 0 ? sources : undefined
    })

    // 返回流式响应
    return result.toDataStreamResponse()
  } catch (error: any) {
    console.error('Chat error:', error)
    return errorResponse(error.message || '对话失败', ErrorCodes.CHAT_STREAM_ERROR)
  }
})
