<template>
  <select
    v-model="localValue"
    class="input-field w-48"
  >
    <option value="">选择模型</option>
    <option
      v-for="model in models"
      :key="model.id"
      :value="model.id"
    >
      {{ model.name }} ({{ model.provider }})
    </option>
  </select>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { ApiResponse } from '~/composables/useAuth'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const models = ref<Array<{ id: string; name: string; provider: string }>>([])

const localValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

async function fetchModels() {
  try {
    const response = await $fetch<ApiResponse<Array<{ id: string; name: string; provider: string; isDefault: boolean }>>>('/api/models')
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

onMounted(() => {
  fetchModels()
})
</script>
