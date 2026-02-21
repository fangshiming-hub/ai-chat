import { ref, computed } from 'vue'

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
      const data = await $fetch<Conversation[]>('/api/conversations', {
        headers: getAuthHeader()
      })
      conversations.value = data.sort((a, b) =>
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
      const data = await $fetch<Conversation>('/api/conversations', {
        method: 'POST',
        headers: getAuthHeader(),
        body: input
      })
      conversations.value.unshift(data)
      return data
    } catch (error) {
      console.error('Failed to create conversation:', error)
      throw error
    }
  }

  async function deleteConversation(id: string) {
    try {
      await $fetch(`/api/conversations/${id}`, {
        method: 'DELETE',
        headers: getAuthHeader()
      })
      conversations.value = conversations.value.filter(c => c.id !== id)
    } catch (error) {
      console.error('Failed to delete conversation:', error)
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
