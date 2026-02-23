<template>
  <aside class="w-56 bg-white dark:bg-surface-900 border-r border-gray-200/50 dark:border-surface-800/50 flex flex-col h-full">
    <!-- 新对话按钮 -->
    <div class="p-3 border-b border-gray-200/50 dark:border-surface-800/50">
      <button
        class="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl
               bg-primary-50 dark:bg-primary-500/10
               text-primary-600 dark:text-primary-400
               hover:bg-primary-100 dark:hover:bg-primary-500/20
               transition-all duration-200 font-medium text-sm"
        @click="$emit('new-chat')"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        新对话
      </button>
    </div>

    <!-- 对话列表 -->
    <div class="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
      <div
        v-for="conv in conversations"
        :key="conv.id"
        class="group flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer
               text-sm transition-all duration-200"
        :class="currentId === conv.id
          ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-700 dark:text-primary-300'
          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-surface-800'"
        @click="$emit('select', conv.id)"
      >
        <div class="flex-1 min-w-0">
          <p class="font-medium truncate">{{ conv.title }}</p>
          <p class="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{{ formatDate(conv.updatedAt) }}</p>
        </div>
        <button
          class="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg
                 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10
                 transition-all duration-200"
          @click.stop="$emit('delete', conv.id)"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      <div v-if="conversations.length === 0" class="text-center py-8 text-gray-400 dark:text-gray-500 text-sm">
        暂无对话
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
defineProps<{
  conversations: Array<{
    id: string
    title: string
    updatedAt: string | Date
  }>
  currentId?: string
}>()

defineEmits<{
  (e: 'select', id: string): void
  (e: 'delete', id: string): void
  (e: 'new-chat'): void
}>()

function formatDate(date: string | Date): string {
  const d = new Date(date)
  const now = new Date()
  const diff = now.getTime() - d.getTime()

  // 今天
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }

  // 昨天
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  if (d.toDateString() === yesterday.toDateString()) {
    return '昨天'
  }

  // 一周内
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
  }

  return d.toLocaleDateString('zh-CN', { year: 'numeric', month: 'short', day: 'numeric' })
}
</script>
