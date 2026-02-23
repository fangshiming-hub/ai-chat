<template>
  <div class="relative">
    <button
      type="button"
      class="w-full bg-gray-100 dark:bg-surface-800 border-0 rounded-xl
             py-2.5 pl-4 pr-10 text-sm text-left
             text-gray-900 dark:text-gray-100
             focus:ring-2 focus:ring-primary-500/20 dark:focus:ring-primary-500/30
             transition-all duration-200
             flex items-center justify-between hover:bg-gray-200 dark:hover:bg-surface-700"
      @click="isOpen = !isOpen"
    >
      <span v-if="selectedLabels.length === 0" class="text-gray-400 dark:text-gray-500">{{ placeholder }}</span>
      <span v-else class="truncate font-medium">{{ selectedLabels.join(', ') }}</span>
      <svg
        class="w-4 h-4 text-gray-400 dark:text-gray-500 ml-2 transition-transform duration-200"
        :class="{ 'rotate-180': isOpen }"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <div
      v-if="isOpen"
      class="absolute z-20 mt-2 w-full bg-white dark:bg-surface-800 shadow-xl max-h-60 rounded-xl py-1 overflow-auto border border-gray-100 dark:border-surface-700"
    >
      <div
        v-for="option in options"
        :key="option.value"
        class="cursor-pointer select-none relative py-2.5 pl-3 pr-9 hover:bg-primary-50 dark:hover:bg-primary-500/10 transition-colors"
        @click="toggleOption(option.value)"
      >
        <div class="flex items-center">
          <input
            type="checkbox"
            :checked="modelValue.includes(option.value)"
            class="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-surface-600 dark:bg-surface-700"
            @click.stop
          />
          <span class="ml-3 block truncate text-gray-700 dark:text-gray-300">{{ option.label }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  modelValue: string[]
  options: Array<{ label: string; value: string }>
  placeholder?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string[]): void
}>()

const isOpen = ref(false)

const selectedLabels = computed(() => {
  return props.modelValue
    .map(v => props.options.find(o => o.value === v)?.label)
    .filter(Boolean) as string[]
})

function toggleOption(value: string) {
  const newValue = props.modelValue.includes(value)
    ? props.modelValue.filter(v => v !== value)
    : [...props.modelValue, value]
  emit('update:modelValue', newValue)
}

function handleClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement
  if (!target.closest('.relative')) {
    isOpen.value = false
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))
</script>
