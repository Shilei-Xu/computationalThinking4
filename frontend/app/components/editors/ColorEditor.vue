<script setup lang="ts">
import type { ObjectColor } from '~/types/board'

defineProps<{ value: ObjectColor }>()
const emit = defineEmits<{ change: [value: ObjectColor] }>()
</script>

<template>
  <div class="flex items-center gap-1">
    <button
      v-for="c in OBJECT_COLORS"
      :key="c.value"
      :title="c.label"
      :aria-label="c.label"
      :aria-pressed="value === c.value"
      class="flex size-8 items-center justify-center rounded-md hover:bg-accent"
      :class="value === c.value && 'bg-accent'"
      @click="emit('change', c.value)"
    >
      <span class="size-5 rounded-full border border-black/15" :class="c.class" />
    </button>
  </div>
</template>
