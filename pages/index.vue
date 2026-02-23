<template>
  <div class="h-full flex bg-surface-50 dark:bg-surface-950">
    <!-- 侧边栏 - 更窄更靠左 -->
    <ChatSidebar
      :conversations="conversations"
      :current-id="currentConversationId"
      @select="selectConversation"
      @delete="deleteConversation"
      @new-chat="startNewChat"
    />

    <!-- 主对话区 - 更宽更居中 -->
    <div class="flex-1 flex flex-col bg-white dark:bg-surface-900">
      <!-- 顶部工具栏 -->
      <div class=" px-6 py-3 border-b border-gray-200/50 dark:border-surface-800/50 flex items-center justify-between bg-white/50 dark:bg-surface-900/50 backdrop-blur-sm">
        <div class="flex items-center gap-3">
          <ModelSelector v-model="selectedModel" />
          <MultiSelect
            v-model="selectedKBs"
            :options="kbOptions"
            placeholder="选择知识库"
            class="w-56"
          />
        </div>

        <!-- 当前对话标题 -->
        <div v-if="currentConversationId" class="text-sm text-gray-500 dark:text-gray-400">
          {{ conversations.find(c => c.id === currentConversationId)?.title }}
        </div>
      </div>

      <!-- 对话区域 - 更宽的容器 -->
      <div ref="chatContainer" class="flex-1 overflow-y-auto custom-scrollbar">
        <div class="max-w-4xl mx-auto px-6 py-6 space-y-6">
          <!-- 空状态 -->
          <div v-if="messages.length === 0" class="flex flex-col items-center justify-center h-96 text-center">
            <div class="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center mb-6 shadow-glow">
              <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">开始一个新的对话</h3>
            <p class="text-gray-500 dark:text-gray-400">选择一个模型，发送消息开始与 AI 对话</p>
          </div>

          <!-- 消息列表 -->
          <template v-else>
            <ChatMessage
              v-for="message in messages"
              :key="message.id"
              :message="message"
            />
          </template>

          <!-- 加载中 -->
          <div v-if="isLoading" class="flex items-center gap-3 text-gray-500 dark:text-gray-400 py-4">
            <div class="w-6 h-6 relative">
              <div class="absolute inset-0 rounded-full border-2 border-primary-500/20"></div>
              <div class="absolute inset-0 rounded-full border-2 border-primary-500 border-t-transparent animate-spin"></div>
            </div>
            <span class="text-sm">AI 正在思考...</span>
          </div>
        </div>
      </div>

      <!-- 输入区域 - 固定在底部 -->
      <div class="border-t border-gray-200/50 dark:border-surface-800/50 bg-white/80 dark:bg-surface-900/80 backdrop-blur-xl">
        <div class="max-w-4xl mx-auto px-6 py-4">
          <ChatInput
            v-model="inputMessage"
            :disabled="isLoading"
            :is-generating="isGenerating"
            @send="handleSend"
            @stop="stopGeneration"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'
import ChatMessage from '~/components/chat/ChatMessage.vue'
import ChatInput from '~/components/chat/ChatInput.vue'
import ChatSidebar from '~/components/chat/ChatSidebar.vue'
import ModelSelector from '~/components/chat/ModelSelector.vue'
import MultiSelect from '~/components/ui/MultiSelect.vue'
import { useChat } from '~/composables/useChat'
import { useConversations } from '~/composables/useConversations'
import type { ApiResponse } from '~/composables/useAuth'

const { messages, isLoading, isGenerating, sendMessage, stopGeneration, clearMessages, setMessages } = useChat()
const { conversations, fetchConversations, deleteConversation: deleteConv, createConversation } = useConversations()

const inputMessage = ref('')
const selectedModel = ref('')
const selectedKBs = ref<string[]>([])
const kbOptions = ref<Array<{ label: string; value: string }>>([])
const currentConversationId = ref<string>()
const chatContainer = ref<HTMLDivElement>()

// 获取知识库列表
async function fetchKnowledgeBases() {
  const { getAuthHeader } = useAuth()
  try {
    const response = await $fetch<ApiResponse<any[]>>('/api/kb', {
      headers: getAuthHeader()
    })
    if (response.statusCode !== 0) {
      console.error('Failed to fetch knowledge bases:', response.msg)
      return
    }
    kbOptions.value = response.data.map((kb: any) => ({
      label: kb.name,
      value: kb.id
    }))
  } catch (error) {
    console.error('Failed to fetch knowledge bases:', error)
  }
}

// 发送消息
async function handleSend() {
  if (!inputMessage.value.trim() || isLoading.value) return

  const userMessage = inputMessage.value
  inputMessage.value = ''

  // 如果没有当前对话，创建一个
  if (!currentConversationId.value) {
    const conv = await createConversation({
      title: userMessage.slice(0, 50) + '...',
      modelId: selectedModel.value,
      kbIds: selectedKBs.value
    })
    currentConversationId.value = conv.id
  }

  await sendMessage(userMessage, {
    modelId: selectedModel.value,
    kbIds: selectedKBs.value,
    conversationId: currentConversationId.value
  })
}

// 选择对话
async function selectConversation(id: string) {
  currentConversationId.value = id
  // 加载对话历史
  const { getAuthHeader } = useAuth()
  try {
    const response = await $fetch<ApiResponse<any>>(`/api/conversations/${id}`, {
      headers: getAuthHeader()
    })
    if (response.statusCode !== 0) {
      console.error('Failed to load conversation:', response.msg)
      return
    }
    // 加载消息到聊天窗口
    if (response.data.messages && response.data.messages.length > 0) {
      const loadedMessages = response.data.messages.map((msg: any) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        sources: msg.sources || []
      }))
      setMessages(loadedMessages)
    } else {
      clearMessages()
    }
    // 恢复模型和知识库选择
    selectedModel.value = response.data.modelId || ''
    selectedKBs.value = response.data.kbIds || []
  } catch (error) {
    console.error('Failed to load conversation:', error)
  }
}

// 删除对话
async function deleteConversation(id: string) {
  if (!confirm('确定要删除这个对话吗？')) return
  await deleteConv(id)
  if (currentConversationId.value === id) {
    startNewChat()
  }
}

// 开始新对话
function startNewChat() {
  currentConversationId.value = undefined
  clearMessages()
  inputMessage.value = ''
}

function scrollToBottom() {
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    }
  })
}

watch(messages, scrollToBottom, { deep: true })

onMounted(async () => {
  // 等待认证状态初始化完成
  const { checkAuth } = useAuth()
  const isAuthenticated = await checkAuth()

  if (isAuthenticated) {
    await fetchKnowledgeBases()
    await fetchConversations()
  }
})
</script>
