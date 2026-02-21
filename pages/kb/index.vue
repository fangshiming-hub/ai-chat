<template>
  <div class="max-w-6xl mx-auto">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">知识库</h1>
      <button class="btn-primary" @click="showAddModal = true">创建知识库</button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="kb in knowledgeBases" :key="kb.id" class="bg-white rounded-lg shadow p-6">
        <div class="flex justify-between items-start">
          <h3 class="text-lg font-medium">{{ kb.name }}</h3>
          <button class="text-gray-400 hover:text-red-600" @click="deleteKB(kb.id)">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
        <p class="text-sm text-gray-500 mt-2">{{ kb.description || '暂无描述' }}</p>
        <div class="mt-4 text-sm text-gray-500">
          <span>模型: {{ kb.embeddingModel }}</span>
        </div>
      </div>
      
      <div v-if="knowledgeBases.length === 0" class="col-span-full text-center py-12 text-gray-500">
        暂无知识库，点击右上角创建
      </div>
    </div>

    <!-- 弹窗 -->
    <div v-if="showAddModal" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <h2 class="text-lg font-medium mb-4">创建知识库</h2>
        <form @submit.prevent="handleSubmit">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium">名称</label>
              <input v-model="form.name" type="text" required class="input-field mt-1" />
            </div>
            <div>
              <label class="block text-sm font-medium">描述</label>
              <textarea v-model="form.description" rows="3" class="input-field mt-1" />
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
  try {
    const response = await $fetch<ApiResponse<any[]>>('/api/kb')
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
  try {
    const response = await $fetch<ApiResponse<any>>('/api/kb', { method: 'POST', body: form.value })
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
  if (!confirm('确定删除？')) return
  try {
    const response = await $fetch<ApiResponse<any>>(`/api/kb/${id}`, { method: 'DELETE' })
    if (response.statusCode !== 0) {
      alert(response.msg || '删除失败')
      return
    }
    await fetchKnowledgeBases()
  } catch (error: any) {
    alert(error.message || '删除失败')
  }
}

onMounted(fetchKnowledgeBases)
</script>
