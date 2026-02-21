import { ref, computed } from 'vue'
import type { ApiResponse } from './useAuth'

export interface Conversation {
  id: string
  title: string
  modelId?: string
  kbIds: string[]
  createdAt: string
  updatedAt: string
}

export function useConversations() {
  const conversations = ref<Conversation[]>([])
  const isLoading = ref(false)
  const { getAuthHeader } = useAuth()

  async function fetchConversations() {
    isLoading.value = true
    try {
      const response = await $fetch<ApiResponse<Conversation[]>>('/api/conversations', {
        headers: getAuthHeader()
      })

      if (response.statusCode !== 0) {
        console.error('Failed to fetch conversations:', response.msg)
        return
      }

      conversations.value = response.data.sort((a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )
    } catch (error) {
      console.error('Failed to fetch conversations:', error)
    } finally {
      isLoading.value = false
    }
  }

  async function createConversation(input: { title?: string; modelId?: string; kbIds?: string[] }) {
    try {
      const response = await $fetch<ApiResponse<Conversation>>('/api/conversations', {
        method: 'POST',
        headers: getAuthHeader(),
        body: input
      })

      if (response.statusCode !== 0) {
        throw new Error(response.msg || '创建对话失败')
      }

      conversations.value.unshift(response.data)
      return response.data
    } catch (error: any) {
      if (error.response?._data) {
        const data = error.response._data as ApiResponse
        throw new Error(data.msg || '创建对话失败')
      }
      throw error
    }
  }

  async function deleteConversation(id: string) {
    try {
      const response = await $fetch<ApiResponse<{ success: boolean }>>(`/api/conversations/${id}`, {
        method: 'DELETE',
        headers: getAuthHeader()
      })

      if (response.statusCode !== 0) {
        throw new Error(response.msg || '删除对话失败')
      }

      conversations.value = conversations.value.filter(c => c.id !== id)
    } catch (error: any) {
      if (error.response?._data) {
        const data = error.response._data as ApiResponse
        throw new Error(data.msg || '删除对话失败')
      }
      throw error
    }
  }

  return {
    conversations: computed(() => conversations.value),
    isLoading: computed(() => isLoading.value),
    fetchConversations,
    createConversation,
    deleteConversation
  }
}
