<template>
  <div class="max-w-4xl mx-auto py-6 px-4">
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">模型配置</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">管理您的 AI 模型和 API 设置</p>
      </div>
      <button class="btn-primary" @click="openAddModal">
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        添加模型
      </button>
    </div>

    <!-- 模型列表卡片 -->
    <div class="card overflow-hidden">
      <ul class="divide-y divide-gray-100 dark:divide-surface-800">
        <li v-for="model in models" :key="model.id" class="group">
          <div class="px-6 py-5 flex items-center justify-between hover:bg-gray-50/50 dark:hover:bg-surface-800/50 transition-colors">
            <div class="flex items-center gap-4">
              <!-- 提供商图标 -->
              <div class="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                   :class="getProviderBgClass(model.provider)">
                {{ getProviderIcon(model.provider) }}
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <p class="text-base font-semibold text-gray-900 dark:text-gray-100">{{ model.name }}</p>
                  <span v-if="model.isDefault" class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 dark:bg-primary-500/20 text-primary-700 dark:text-primary-300">默认</span>
                </div>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{{ model.model }}</p>
              </div>
            </div>
            <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button class="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-surface-700 hover:text-primary-600 transition-colors" @click="editModel(model)">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button v-if="!model.isDefault" class="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-surface-700 hover:text-primary-600 transition-colors" @click="setDefault(model.id)" title="设为默认">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </button>
              <button class="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 transition-colors" @click="deleteModel(model.id)">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </li>
        <li v-if="models.length === 0" class="px-6 py-12 text-center">
          <div class="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-surface-800 flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          <p class="text-gray-500 dark:text-gray-400">暂无模型配置</p>
          <p class="text-sm text-gray-400 dark:text-gray-500 mt-1">点击右上角添加您的第一个模型</p>
        </li>
      </ul>
    </div>

    <!-- 添加/编辑模型弹窗 -->
    <div v-if="showAddModal" class="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-white dark:bg-surface-900 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-200 dark:border-surface-800">
        <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">{{ editingModel ? '编辑模型' : '添加模型' }}</h2>

        <form @submit.prevent="handleSubmit">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">名称</label>
              <input v-model="form.name" type="text" required class="input-field" placeholder="如: GPT-4" />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">提供商</label>
              <select v-model="form.provider" required class="input-field">
                <option value="openai">OpenAI</option>
                <option value="anthropic">Anthropic</option>
                <option value="google">Google</option>
                <option value="custom">自定义 (OpenAI兼容)</option>
              </select>
            </div>

            <div v-if="form.provider === 'custom'">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">基础 URL</label>
              <input v-model="form.baseUrl" type="url" placeholder="https://api.example.com/v1" class="input-field" />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">API Key</label>
              <input v-model="form.apiKey" type="password" required class="input-field" />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">模型 ID</label>
              <input v-model="form.model" type="text" placeholder="gpt-4, claude-3-opus" required class="input-field" />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">温度 (0-2)</label>
              <input v-model="form.temperature" type="number" min="0" max="2" step="0.1" class="input-field" />
            </div>

            <div class="flex items-center pt-2">
              <input id="isDefault" v-model="form.isDefault" type="checkbox" class="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
              <label for="isDefault" class="ml-2 text-sm text-gray-900 dark:text-gray-100">设为默认模型</label>
            </div>
          </div>

          <div class="mt-6 flex justify-end gap-3">
            <button type="button" class="btn-secondary" @click="closeModal">取消</button>
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
  baseUrl?: string
  apiKey: string
  temperature?: number
  isDefault: boolean
}

const models = ref<Model[]>([])
const showAddModal = ref(false)
const editingModel = ref<Model | null>(null)
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
    const body = {
      ...form.value,
      temperature: parseFloat(form.value.temperature)
    }

    let response: ApiResponse<any>
    if (editingModel.value) {
      // 编辑模式
      response = await $fetch<ApiResponse<any>>(`/api/models/${editingModel.value.id}`, {
        method: 'PUT',
        headers: getAuthHeader(),
        body
      })
    } else {
      // 新增模式
      response = await $fetch<ApiResponse<any>>('/api/models', {
        method: 'POST',
        headers: getAuthHeader(),
        body
      })
    }

    if (response.statusCode !== 0) {
      alert(response.msg || (editingModel.value ? '更新失败' : '添加失败'))
      return
    }
    closeModal()
    await fetchModels()
  } catch (error: any) {
    alert(error.message || (editingModel.value ? '更新失败' : '添加失败'))
  }
}

function editModel(model: Model) {
  editingModel.value = model
  form.value = {
    name: model.name,
    provider: model.provider,
    baseUrl: model.baseUrl || '',
    apiKey: model.apiKey,
    model: model.model,
    temperature: String(model.temperature ?? 0.7),
    isDefault: model.isDefault
  }
  showAddModal.value = true
}

function openAddModal() {
  editingModel.value = null
  form.value = { name: '', provider: 'openai', baseUrl: '', apiKey: '', model: '', temperature: '0.7', isDefault: false }
  showAddModal.value = true
}

function closeModal() {
  showAddModal.value = false
  editingModel.value = null
  form.value = { name: '', provider: 'openai', baseUrl: '', apiKey: '', model: '', temperature: '0.7', isDefault: false }
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

function getProviderIcon(provider: string): string {
  const icons: Record<string, string> = {
    openai: '🤖',
    anthropic: '🧠',
    google: '🔍',
    custom: '⚙️'
  }
  return icons[provider] || '🤖'
}

function getProviderBgClass(provider: string): string {
  const classes: Record<string, string> = {
    openai: 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400',
    anthropic: 'bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400',
    google: 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400',
    custom: 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400'
  }
  return classes[provider] || 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400'
}
</script>
