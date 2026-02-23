<template>
  <div class="relative">
    <select
      v-model="localValue"
      class="appearance-none w-44 bg-gray-100 dark:bg-surface-800 border-0 rounded-xl
             py-2.5 pl-4 pr-10 text-sm font-medium
             text-gray-900 dark:text-gray-100
             focus:ring-2 focus:ring-primary-500/20 dark:focus:ring-primary-500/30
             transition-all duration-200 cursor-pointer hover:bg-gray-200 dark:hover:bg-surface-700"
    >
      <option value="">选择模型</option>
      <option
        v-for="model in models"
        :key="model.id"
        :value="model.id"
      >
        {{ model.name }}
      </option>
    </select>
    <!-- 下拉箭头 -->
    <div class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 dark:text-gray-400">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
    <!-- 模型图标 -->
    <div v-if="selectedModel" class="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
      <div class="w-2 h-2 rounded-full" :class="getProviderColor(selectedModel.provider)" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { ApiResponse } from '~/composables/useAuth'

interface Model {
  id: string
  name: string
  provider: string
  isDefault: boolean
}

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const models = ref<Model[]>([])

const localValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const selectedModel = computed(() => {
  return models.value.find(m => m.id === localValue.value)
})

function getProviderColor(provider: string) {
  const colors: Record<string, string> = {
    openai: 'bg-green-500',
    anthropic: 'bg-orange-500',
    google: 'bg-blue-500',
    custom: 'bg-purple-500'
  }
  return colors[provider] || 'bg-gray-500'
}

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
    // 自动选择默认模型
    const defaultModel = response.data.find((m) => m.isDefault)
    if (defaultModel && !localValue.value) {
      localValue.value = defaultModel.id
    }
  } catch (error) {
    console.error('Failed to fetch models:', error)
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
