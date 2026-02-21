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
        type="button"
        class="btn-primary self-end"
        :disabled="!localValue.trim() || disabled"
        @click="handleSend"
      >
        <span v-if="disabled">发送中...</span>
        <span v-else>发送</span>
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
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'send'): void
}>()

const localValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

function handleSend() {
  if (!localValue.value.trim() || props.disabled) return
  emit('send')
}

function handleEnter(event: KeyboardEvent) {
  if (event.shiftKey) {
    return
  }
  handleSend()
}
</script>
