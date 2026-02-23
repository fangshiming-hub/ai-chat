<template>
  <div class="relative">
    <div class="flex gap-3">
      <div class="flex-1 relative">
        <textarea
          v-model="localValue"
          rows="1"
          class="w-full resize-none rounded-2xl border-0 bg-gray-100 dark:bg-surface-800
                 text-gray-900 dark:text-gray-100
                 placeholder-gray-500 dark:placeholder-gray-400
                 focus:ring-2 focus:ring-primary-500/20 dark:focus:ring-primary-500/30
                 focus:bg-white dark:focus:bg-surface-800
                 transition-all duration-200
                 py-3.5 px-5 pr-12 text-sm leading-6"
          placeholder="输入消息..."
          :disabled="disabled"
          @keydown.enter.prevent="handleEnter"
          @input="autoResize"
        />
        <!-- 快捷提示 -->
        <div class="absolute right-3 bottom-3 text-xs text-gray-400 dark:text-gray-500 pointer-events-none">
          ↵
        </div>
      </div>

      <!-- 停止按钮 -->
      <button
        v-if="isGenerating"
        type="button"
        class="flex-shrink-0 btn-secondary flex items-center gap-2"
        @click="handleStop"
      >
        <div class="w-3 h-3 rounded-sm bg-current" />
        <span>停止</span>
      </button>

      <!-- 发送按钮 -->
      <button
        v-else
        type="button"
        class="flex-shrink-0 btn-primary"
        :disabled="!localValue.trim() || disabled"
        @click="handleSend"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick } from 'vue'

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

function autoResize(event: Event) {
  const textarea = event.target as HTMLTextAreaElement
  textarea.style.height = 'auto'
  textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px'
}

function handleSend() {
  if (!localValue.value.trim() || props.disabled) return
  emit('send')
  // 重置高度
  nextTick(() => {
    const textarea = document.querySelector('textarea')
    if (textarea) {
      textarea.style.height = 'auto'
    }
  })
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
