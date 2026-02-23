<template>
  <div class="max-w-6xl mx-auto py-6 px-4">
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">知识库</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">管理您的文档和知识库</p>
      </div>
      <button class="btn-primary" @click="showAddModal = true">
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        创建知识库
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="kb in knowledgeBases" :key="kb.id" class="card group hover:shadow-glow transition-all duration-300">
        <div class="p-6">
          <div class="flex justify-between items-start mb-4">
            <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xl shadow-lg">
              📚
            </div>
            <button
              class="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
              @click="deleteKB(kb.id)"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{{ kb.name }}</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{{ kb.description || '暂无描述' }}</p>
          <div class="mt-4 flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span>{{ kb.embeddingModel }}</span>
          </div>
        </div>
      </div>

      <div v-if="knowledgeBases.length === 0" class="col-span-full">
        <div class="card p-12 text-center">
          <div class="w-20 h-20 rounded-2xl bg-gray-100 dark:bg-surface-800 flex items-center justify-center mx-auto mb-4">
            <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <p class="text-gray-500 dark:text-gray-400 font-medium">暂无知识库</p>
          <p class="text-sm text-gray-400 dark:text-gray-500 mt-1">点击右上角创建您的第一个知识库</p>
        </div>
      </div>
    </div>

    <!-- 创建知识库弹窗 -->
    <div v-if="showAddModal" class="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-white dark:bg-surface-900 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-200 dark:border-surface-800">
        <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">创建知识库</h2>
        <form @submit.prevent="handleSubmit">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">名称</label>
              <input v-model="form.name" type="text" required class="input-field" placeholder="输入知识库名称" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">描述</label>
              <textarea v-model="form.description" rows="3" class="input-field" placeholder="描述这个知识库的用途" />
            </div>
          </div>
          <div class="mt-6 flex justify-end gap-3">
            <button type="button" class="btn-secondary" @click="showAddModal = false">取消</button>
            <button type="submit" class="btn-primary">创建</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { ApiResponse } from '~/composables/useAuth'

const knowledgeBases = ref<any[]>([])
const showAddModal = ref(false)
const form = ref({ name: '', description: '' })

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
    knowledgeBases.value = response.data
  } catch (error) {
    console.error('Failed to fetch knowledge bases:', error)
  }
}

async function handleSubmit() {
  const { getAuthHeader } = useAuth()
  try {
    const response = await $fetch<ApiResponse<any>>('/api/kb', {
      method: 'POST',
      headers: getAuthHeader(),
      body: form.value
    })
    if (response.statusCode !== 0) {
      alert(response.msg || '创建失败')
      return
    }
    showAddModal.value = false
    form.value = { name: '', description: '' }
    await fetchKnowledgeBases()
  } catch (error: any) {
    alert(error.message || '创建失败')
  }
}

async function deleteKB(id: string) {
  const { getAuthHeader } = useAuth()
  if (!confirm('确定删除这个知识库吗？')) return
  try {
    const response = await $fetch<ApiResponse<any>>(`/api/kb/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    })
    if (response.statusCode !== 0) {
      alert(response.msg || '删除失败')
      return
    }
    await fetchKnowledgeBases()
  } catch (error: any) {
    alert(error.message || '删除失败')
  }
}

onMounted(async () => {
  const { checkAuth } = useAuth()
  const isAuthenticated = await checkAuth()
  if (isAuthenticated) {
    await fetchKnowledgeBases()
  }
})
</script>
