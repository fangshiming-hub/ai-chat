<template>
  <div class="h-[calc(100vh-8rem)] flex">
    <!-- 侧边栏 -->
    <ChatSidebar
      :conversations="conversations"
      :current-id="currentConversationId"
      @select="selectConversation"
      @delete="deleteConversation"
      @new-chat="startNewChat"
    />

    <!-- 主对话区 -->
    <div class="flex-1 flex flex-col bg-white">
      <!-- 模型选择器 -->
      <div class="p-4 border-b border-gray-200 flex items-center gap-4">
        <ModelSelector v-model="selectedModel" />
        <MultiSelect
          v-model="selectedKBs"
          :options="kbOptions"
          placeholder="选择知识库"
          class="w-64"
        />
      </div>

      <!-- 对话区域 -->
      <div ref="chatContainer" class="flex-1 overflow-y-auto p-4 space-y-4">
        <div v-if="messages.length === 0" class="text-center text-gray-500 py-12">
          <p class="text-lg">开始一个新的对话</p>
          <p class="text-sm mt-2">发送消息开始与 AI 对话</p>
        </div>
        <ChatMessage
          v-for="message in messages"
          :key="message.id"
          :message="message"
        />
        <div v-if="isLoading" class="flex items-center gap-2 text-gray-500">
          <div class="animate-spin h-4 w-4 border-2 border-primary-500 border-t-transparent rounded-full" />
          <span>AI 正在思考...</span>
        </div>
      </div>

      <!-- 输入区域 -->
      <ChatInput
        v-model="inputMessage"
        :disabled="isLoading"
        @send="handleSend"
      />
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

const { messages, isLoading, sendMessage, clearMessages } = useChat()
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
    // 加载消息...
    // TODO: 从 response.data 加载消息到 messages
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
