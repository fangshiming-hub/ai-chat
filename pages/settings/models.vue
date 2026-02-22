<template>
  <div class="max-w-4xl mx-auto">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">模型配置</h1>
      <button class="btn-primary" @click="showAddModal = true">添加模型</button>
    </div>

    <div class="bg-white shadow overflow-hidden sm:rounded-md">
      <ul class="divide-y divide-gray-200">
        <li v-for="model in models" :key="model.id">
          <div class="px-4 py-4 flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-900">
                {{ model.name }}
                <span v-if="model.isDefault" class="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">默认</span>
              </p>
              <p class="text-sm text-gray-500">{{ model.provider }} / {{ model.model }}</p>
            </div>
            <div class="flex gap-2">
              <button v-if="!model.isDefault" class="btn-secondary text-xs" @click="setDefault(model.id)">设为默认</button>
              <button class="text-red-600 hover:text-red-800 text-sm" @click="deleteModel(model.id)">删除</button>
            </div>
          </div>
        </li>
        <li v-if="models.length === 0" class="px-4 py-8 text-center text-gray-500">
          暂无模型配置，请点击右上角添加
        </li>
      </ul>
    </div>

    <!-- 添加模型弹窗 -->
    <div v-if="showAddModal" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <h2 class="text-lg font-medium mb-4">添加模型</h2>
        
        <form @submit.prevent="handleSubmit">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">名称</label>
              <input v-model="form.name" type="text" required class="input-field mt-1" placeholder="如: GPT-4" />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">提供商</label>
              <select v-model="form.provider" required class="input-field mt-1">
                <option value="openai">OpenAI</option>
                <option value="anthropic">Anthropic</option>
                <option value="google">Google</option>
                <option value="custom">自定义 (OpenAI兼容)</option>
              </select>
            </div>

            <div v-if="form.provider === 'custom'">
              <label class="block text-sm font-medium text-gray-700">基础 URL</label>
              <input v-model="form.baseUrl" type="url" placeholder="https://api.example.com/v1" class="input-field mt-1" />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">API Key</label>
              <input v-model="form.apiKey" type="password" required class="input-field mt-1" />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">模型 ID</label>
              <input v-model="form.model" type="text" placeholder="gpt-4, claude-3-opus" required class="input-field mt-1" />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">温度 (0-2)</label>
              <input v-model="form.temperature" type="number" min="0" max="2" step="0.1" class="input-field mt-1" />
            </div>

            <div class="flex items-center">
              <input id="isDefault" v-model="form.isDefault" type="checkbox" class="h-4 w-4 text-primary-600 border-gray-300 rounded" />
              <label for="isDefault" class="ml-2 block text-sm text-gray-900">设为默认模型</label>
            </div>
          </div>

          <div class="mt-6 flex justify-end gap-3">
            <button type="button" class="btn-secondary" @click="showAddModal = false">取消</button>
            <button type="submit" class="btn-primary">保存</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { ApiResponse } from '~/composables/useAuth'

interface Model {
  id: string
  name: string
  provider: string
  model: string
  isDefault: boolean
}

const models = ref<Model[]>([])
const showAddModal = ref(false)
const form = ref({
  name: '',
  provider: 'openai',
  baseUrl: '',
  apiKey: '',
  model: '',
  temperature: '0.7',
  isDefault: false
})

async function fetchModels() {
  const { getAuthHeader } = useAuth()
  try {
    const response = await $fetch<ApiResponse<Model[]>>('/api/models', {
      headers: getAuthHeader()
    })
    if (response.statusCode !== 0) {
      console.error('Failed to fetch models:', response.msg)
      return
    }
    models.value = response.data
  } catch (error) {
    console.error('Failed:', error)
  }
}

async function handleSubmit() {
  const { getAuthHeader } = useAuth()
  try {
    const response = await $fetch<ApiResponse<any>>('/api/models', {
      method: 'POST',
      headers: getAuthHeader(),
      body: {
        ...form.value,
        temperature: parseFloat(form.value.temperature)
      }
    })
    if (response.statusCode !== 0) {
      alert(response.msg || '添加失败')
      return
    }
    showAddModal.value = false
    form.value = { name: '', provider: 'openai', baseUrl: '', apiKey: '', model: '', temperature: '0.7', isDefault: false }
    await fetchModels()
  } catch (error: any) {
    alert(error.message || '添加失败')
  }
}

async function setDefault(id: string) {
  const { getAuthHeader } = useAuth()
  try {
    const response = await $fetch<ApiResponse<any>>(`/api/models/${id}/default`, {
      method: 'POST',
      headers: getAuthHeader()
    })
    if (response.statusCode !== 0) {
      alert(response.msg || '设置失败')
      return
    }
    await fetchModels()
  } catch (error: any) {
    alert(error.message || '设置失败')
  }
}

async function deleteModel(id: string) {
  const { getAuthHeader } = useAuth()
  if (!confirm('确定要删除这个模型吗？')) return
  try {
    const response = await $fetch<ApiResponse<any>>(`/api/models/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    })
    if (response.statusCode !== 0) {
      alert(response.msg || '删除失败')
      return
    }
    await fetchModels()
  } catch (error: any) {
    alert(error.message || '删除失败')
  }
}

onMounted(async () => {
  const { checkAuth } = useAuth()
  const isAuthenticated = await checkAuth()
  if (isAuthenticated) {
    await fetchModels()
  }
})
</script>
