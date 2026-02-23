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
      <!-- Markdown 渲染内容 -->
      <div class="markdown-content text-sm text-gray-800 leading-relaxed" v-html="renderedContent" />

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
import { computed } from 'vue'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

const props = defineProps<{
  message: {
    id: string
    role: 'user' | 'assistant' | 'system'
    content: string
    sources?: any[]
  }
}>()

// 配置 marked 选项
marked.setOptions({
  breaks: true,      // 支持换行符转换为 <br>
  gfm: true,         // 启用 GitHub Flavored Markdown
  headerIds: false,  // 禁用标题 ID
  mangle: false      // 禁用 email 地址混淆
})

// 渲染 Markdown 并清理 HTML
const renderedContent = computed(() => {
  if (!props.message.content) return ''
  const rawHtml = marked.parse(props.message.content) as string
  return DOMPurify.sanitize(rawHtml)
})
</script>

<style scoped>
/* Markdown 样式 */
.markdown-content :deep(h1) {
  font-size: 1.5em;
  font-weight: bold;
  margin: 0.5em 0;
}

.markdown-content :deep(h2) {
  font-size: 1.25em;
  font-weight: bold;
  margin: 0.5em 0;
}

.markdown-content :deep(h3) {
  font-size: 1.1em;
  font-weight: bold;
  margin: 0.5em 0;
}

.markdown-content :deep(p) {
  margin: 0.5em 0;
}

.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  margin: 0.5em 0;
  padding-left: 1.5em;
}

.markdown-content :deep(ul) {
  list-style-type: disc;
}

.markdown-content :deep(ol) {
  list-style-type: decimal;
}

.markdown-content :deep(li) {
  margin: 0.25em 0;
}

.markdown-content :deep(pre) {
  background-color: #1f2937;
  color: #e5e7eb;
  padding: 1em;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin: 0.5em 0;
}

.markdown-content :deep(code) {
  font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace;
  font-size: 0.9em;
}

.markdown-content :deep(pre code) {
  background: none;
  color: inherit;
  padding: 0;
}

.markdown-content :deep(:not(pre) > code) {
  background-color: #e5e7eb;
  color: #374151;
  padding: 0.2em 0.4em;
  border-radius: 0.25rem;
}

.markdown-content :deep(blockquote) {
  border-left: 4px solid #d1d5db;
  padding-left: 1em;
  margin: 0.5em 0;
  color: #6b7280;
}

.markdown-content :deep(a) {
  color: #2563eb;
  text-decoration: underline;
}

.markdown-content :deep(a:hover) {
  color: #1d4ed8;
}

.markdown-content :deep(table) {
  border-collapse: collapse;
  margin: 0.5em 0;
  width: 100%;
}

.markdown-content :deep(th),
.markdown-content :deep(td) {
  border: 1px solid #d1d5db;
  padding: 0.5em;
  text-align: left;
}

.markdown-content :deep(th) {
  background-color: #f3f4f6;
  font-weight: bold;
}

.markdown-content :deep(hr) {
  border: none;
  border-top: 1px solid #d1d5db;
  margin: 1em 0;
}
</style>
