import { ref, computed } from 'vue'
import type { ApiResponse } from './useAuth'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  sources?: any[]
}

export function useChat() {
  const messages = ref<ChatMessage[]>([])
  const isLoading = ref(false)
  const isGenerating = ref(false)
  const conversationId = ref<string | null>(null)
  const error = ref<string | null>(null)
  const { getAuthHeader } = useAuth()
  let abortController: AbortController | null = null

  async function sendMessage(
    content: string,
    options: { modelId?: string; kbIds?: string[]; conversationId?: string } = {}
  ) {
    if (!content.trim() || isLoading.value) return

    isLoading.value = true
    isGenerating.value = true
    error.value = null

    // 添加用户消息
    messages.value.push({
      id: Date.now().toString(),
      role: 'user',
      content
    })

    // 创建新的 AbortController
    abortController = new AbortController()

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify({
          message: content,
          conversationId: options.conversationId || conversationId.value,
          modelId: options.modelId,
          kbIds: options.kbIds
        }),
        signal: abortController.signal
      })

      // 检查是否是错误响应 (非流式)
      const contentType = response.headers.get('content-type')
      if (contentType?.includes('application/json')) {
        const errorData = await response.json() as ApiResponse
        throw new Error(errorData.msg || '发送消息失败')
      }

      if (!response.ok) {
        throw new Error('发送消息失败')
      }

      if (!response.body) {
        throw new Error('响应为空')
      }

      // 添加 AI 消息占位
      const aiMessageId = (Date.now() + 1).toString()
      messages.value.push({
        id: aiMessageId,
        role: 'assistant',
        content: ''
      })

      // 读取流
      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        if (!abortController) break
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('0:')) {
            // 文本内容
            const content = line.slice(2).replace(/^"|"$/g, '')
            const lastMessage = messages.value[messages.value.length - 1]
            if (lastMessage?.role === 'assistant') {
              lastMessage.content += content
            }
          } else if (line.startsWith('3:')) {
            // 错误消息
            const errorMsg = line.slice(2).replace(/^"|"$/g, '')
            throw new Error(errorMsg || 'AI 响应错误')
          }
        }
      }
    } catch (err: any) {
      // 如果是用户主动中断，不显示错误
      if (err.name === 'AbortError') {
        console.log('用户中断了生成')
        return
      }
      console.error('Chat error:', err)
      error.value = err.message || '发送消息失败'
      messages.value.push({
        id: Date.now().toString(),
        role: 'assistant',
        content: `抱歉，发生了错误：${err.message || '请稍后重试'}`
      })
    } finally {
      isLoading.value = false
      isGenerating.value = false
      abortController = null
    }
  }

  function stopGeneration() {
    if (abortController) {
      abortController.abort()
      abortController = null
      isGenerating.value = false
      isLoading.value = false
    }
  }

  function clearMessages() {
    messages.value = []
    conversationId.value = null
    error.value = null
  }

  function setMessages(newMessages: ChatMessage[]) {
    messages.value = newMessages
  }

  return {
    messages: computed(() => messages.value),
    isLoading: computed(() => isLoading.value),
    isGenerating: computed(() => isGenerating.value),
    error: computed(() => error.value),
    conversationId: computed(() => conversationId.value),
    sendMessage,
    stopGeneration,
    clearMessages,
    setMessages
  }
}
