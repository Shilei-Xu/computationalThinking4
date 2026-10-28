<script setup lang="ts">
import { Ban } from '@lucide/vue'
import type { DeepReadonly } from 'vue'
import type { Border } from '~/types/board'

const WIDTHS = [
  { value: 0, label: 'Kein' },
  { value: 2, label: 'Dünn' },
  { value: 4, label: 'Dick' },
]

const props = defineProps<{ value: DeepReadonly<Border> }>()
const emit = defineEmits<{ change: [value: Border] }>()

function change(patch: Partial<Border>) {
  emit('change', { ...props.value, ...patch })
}
</script>

<template>
  <div class="flex items-center gap-1">
    <button
      v-for="w in WIDTHS"
      :key="w.value"
      :title="`Rand ${w.label}`"
      :aria-label="`Rand ${w.label}`"
      :aria-pressed="value.width === w.value"
      class="flex size-8 items-center justify-center rounded-md hover:bg-accent"
      :class="value.width === w.value && 'bg-accent'"
      @click="change({ width: w.value })"
    >
      <Ban v-if="w.value === 0" class="size-4" />
      <span v-else class="w-4 rounded-full bg-foreground" :style="{ height: `${w.value}px` }" />
    </button>
    <button
      v-for="c in BORDER_COLORS"
      :key="c.value"
      :title="`Randfarbe ${c.label}`"
      :aria-label="`Randfarbe ${c.label}`"
      :aria-pressed="value.color === c.value"
      class="flex size-8 items-center justify-center rounded-md hover:bg-accent"
      :class="value.color === c.value && 'bg-accent'"
      @click="change({ color: c.value })"
    >
      <span class="size-4 rounded-full" :class="c.swatch" />
    </button>
  </div>
</template>
