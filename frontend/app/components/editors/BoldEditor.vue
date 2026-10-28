<script setup lang="ts">
import { Bold } from '@lucide/vue'

defineProps<{ value: boolean }>()
const emit = defineEmits<{ change: [value: boolean] }>()
</script>

<template>
  <button
    title="Fett"
    aria-label="Fett"
    :aria-pressed="value"
    class="flex size-8 items-center justify-center rounded-md hover:bg-accent"
    :class="value && 'bg-accent'"
    @click="emit('change', !value)"
  >
    <Bold class="size-4" />
  </button>
</template>
