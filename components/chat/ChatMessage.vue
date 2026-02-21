<template>
  <div
    class="flex gap-4 p-4 rounded-lg"
    :class="message.role === 'user' ? 'bg-primary-50' : 'bg-gray-50'"
  >
    <!-- 头像 -->
    <div class="flex-shrink-0">
      <div
        class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
        :class="message.role === 'user' ? 'bg-primary-500 text-white' : 'bg-gray-600 text-white'"
      >
        {{ message.role === 'user' ? 'U' : 'AI' }}
      </div>
    </div>

    <!-- 内容 -->
    <div class="flex-1 min-w-0">
      <div class="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
        {{ message.content }}
      </div>

      <!-- 引用来源 -->
      <div v-if="message.sources?.length" class="mt-3 pt-3 border-t border-gray-200">
        <p class="text-xs text-gray-500 mb-2">参考来源：</p>
        <div class="space-y-1">
          <div
            v-for="(source, index) in message.sources"
            :key="index"
            class="text-xs text-gray-600 bg-white px-2 py-1 rounded border"
          >
            [{{ index + 1 }}] {{ source.documentName }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  message: {
    id: string
    role: 'user' | 'assistant' | 'system'
    content: string
    sources?: any[]
  }
}>()
</script>
