<script setup lang="ts">
const FONT_SIZES = [
  { value: 14, label: 'S' },
  { value: 18, label: 'M' },
  { value: 24, label: 'L' },
  { value: 32, label: 'XL' },
]

defineProps<{ value: number }>()
const emit = defineEmits<{ change: [value: number] }>()
</script>

<template>
  <div class="flex items-center gap-1">
    <button
      v-for="size in FONT_SIZES"
      :key="size.value"
      :title="`Schriftgröße ${size.label}`"
      :aria-label="`Schriftgröße ${size.label}`"
      :aria-pressed="value === size.value"
      class="flex h-8 min-w-8 items-center justify-center rounded-md px-1 text-sm hover:bg-accent"
      :class="value === size.value && 'bg-accent'"
      @click="emit('change', size.value)"
    >
      {{ size.label }}
    </button>
  </div>
</template>
