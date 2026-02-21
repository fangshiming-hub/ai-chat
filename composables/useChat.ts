import { ref, computed } from 'vue'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  sources?: any[]
}

export function useChat() {
  const messages = ref<ChatMessage[]>([])
  const isLoading = ref(false)
  const conversationId = ref<string | null>(null)
  const { getAuthHeader } = useAuth()

  async function sendMessage(
    content: string,
    options: { modelId?: string; kbIds?: string[]; conversationId?: string } = {}
  ) {
    if (!content.trim() || isLoading.value) return

    isLoading.value = true

    // 添加用户消息
    messages.value.push({
      id: Date.now().toString(),
      role: 'user',
      content
    })

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
        })
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      // 添加 AI 消息占位
      const aiMessageId = (Date.now() + 1).toString()
      messages.value.push({
        id: aiMessageId,
        role: 'assistant',
        content: ''
      })

      // 读取流
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (line.startsWith('0:')) {
              const content = line.slice(2).replace(/^"|"$/g, '')
              const lastMessage = messages.value[messages.value.length - 1]
              if (lastMessage?.role === 'assistant') {
                lastMessage.content += content
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error)
      messages.value.push({
        id: Date.now().toString(),
        role: 'assistant',
        content: '抱歉，发生了错误，请稍后重试。'
      })
    } finally {
      isLoading.value = false
    }
  }

  function clearMessages() {
    messages.value = []
    conversationId.value = null
  }

  return {
    messages: computed(() => messages.value),
    isLoading: computed(() => isLoading.value),
    conversationId: computed(() => conversationId.value),
    sendMessage,
    clearMessages
  }
}
