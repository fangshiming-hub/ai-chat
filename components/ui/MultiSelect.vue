<template>
  <div class="relative">
    <button
      type="button"
      class="input-field text-left flex items-center justify-between"
      @click="isOpen = !isOpen"
    >
      <span v-if="selectedLabels.length === 0" class="text-gray-400">{{ placeholder }}</span>
      <span v-else class="truncate">{{ selectedLabels.join(', ') }}</span>
      <svg
        class="w-4 h-4 text-gray-400 ml-2"
        :class="{ 'transform rotate-180': isOpen }"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <div
      v-if="isOpen"
      class="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto"
    >
      <div
        v-for="option in options"
        :key="option.value"
        class="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-primary-50"
        @click="toggleOption(option.value)"
      >
        <div class="flex items-center">
          <input
            type="checkbox"
            :checked="modelValue.includes(option.value)"
            class="h-4 w-4 text-primary-600 border-gray-300 rounded"
            @click.stop
          />
          <span class="ml-3 block truncate">{{ option.label }}</span>
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
