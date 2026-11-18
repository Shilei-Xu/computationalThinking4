<script setup lang="ts">
import { Pencil, Trash2 } from '@lucide/vue'
import type { Board } from '~/types/board'

const props = defineProps<{ board: Board; active: boolean; editing: boolean }>()
const emit = defineEmits<{ edit: []; rename: [name: string]; delete: [] }>()

const input = ref<HTMLInputElement>()
let cancelled = false

// The input opens with the whole name selected, ready to be typed over.
watch(() => props.editing, async (editing) => {
  if (!editing) return
  cancelled = false
  await nextTick()
  input.value?.select()
}, { immediate: true })

// Enter and clicking elsewhere both end in blur; Escape keeps the old name.
function onBlur() {
  emit('rename', cancelled ? props.board.name : input.value!.value)
}

function onCancel() {
  cancelled = true
  input.value?.blur()
}
</script>

<template>
  <li class="group flex items-center gap-0.5 rounded-lg pr-1" :class="active ? 'bg-muted' : 'hover:bg-muted/60'">
    <input
      v-if="editing"
      ref="input"
      :value="board.name"
      aria-label="Board name"
      class="m-0.5 min-w-0 flex-1 rounded-md border bg-white px-1.5 py-1 text-sm outline-none focus:ring-2 focus:ring-ring/50"
      @keydown.enter="input?.blur()"
      @keydown.esc="onCancel"
      @blur="onBlur"
    >
    <template v-else>
      <NuxtLink
        :to="`/boards/${board.id}`"
        class="min-w-0 flex-1 truncate px-2 py-1.5 text-sm"
        :class="active && 'font-medium'"
        @dblclick="emit('edit')"
      >
        {{ board.name }}
      </NuxtLink>
      <Button
        variant="ghost"
        size="icon-xs"
        class="opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
        aria-label="Rename board"
        @click="emit('edit')"
      >
        <Pencil />
      </Button>
      <Button
        variant="ghost"
        size="icon-xs"
        class="opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
        aria-label="Delete board"
        @click="emit('delete')"
      >
        <Trash2 />
      </Button>
    </template>
  </li>
</template>
