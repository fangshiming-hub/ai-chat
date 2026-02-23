<template>
  <div class="bg-white p-4 rounded-lg shadow border border-gray-200">
    <div class="flex gap-4">
      <textarea
        v-model="localValue"
        rows="2"
        class="flex-1 resize-none rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
        placeholder="输入消息..."
        :disabled="disabled"
        @keydown.enter.prevent="handleEnter"
      />
      <button
        v-if="isGenerating"
        type="button"
        class="btn-secondary self-end flex items-center gap-2"
        @click="handleStop"
      >
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <rect x="3" y="3" width="14" height="14" rx="2" />
        </svg>
        <span>停止</span>
      </button>
      <button
        v-else
        type="button"
        class="btn-primary self-end"
        :disabled="!localValue.trim() || disabled"
        @click="handleSend"
      >
        <span>发送</span>
      </button>
    </div>
    <p class="text-xs text-gray-500 mt-2">按 Enter 发送，Shift + Enter 换行</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  modelValue: string
  disabled?: boolean
  isGenerating?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'send'): void
  (e: 'stop'): void
}>()

const localValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

function handleSend() {
  if (!localValue.value.trim() || props.disabled) return
  emit('send')
}

function handleStop() {
  emit('stop')
}

function handleEnter(event: KeyboardEvent) {
  if (event.shiftKey) {
    return
  }
  if (!props.isGenerating) {
    handleSend()
  }
}
</script>
