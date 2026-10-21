<script setup lang="ts">
import { nextTick, reactive, ref } from 'vue'
import { useDrag } from '~/composables/useDrag'
import { GRID, snap } from '~/utils/grid'

const MIN_SIZE = GRID * 4
const DOUBLE_TAP_MS = 300
// Pointer movement below this many pixels counts as a tap, not a drag.
const TAP_DISTANCE = 4

const note = reactive({ x: GRID * 5, y: GRID * 5, width: GRID * 8, height: GRID * 8, text: 'Neue Notiz' })
const editing = ref(false)
const textarea = ref<HTMLTextAreaElement>()
let dragStart = { x: 0, y: 0 }
let lastTap = 0

// Double-click/double-tap is detected by hand, because touch browsers
// do not reliably fire dblclick.
async function onTap() {
  const now = Date.now()
  const isDoubleTap = now - lastTap < DOUBLE_TAP_MS
  lastTap = isDoubleTap ? 0 : now
  if (!isDoubleTap) return
  editing.value = true
  await nextTick()
  textarea.value?.focus()
}

const onMoveStart = useDrag({
  start() {
    dragStart = { x: note.x, y: note.y }
  },
  move(dx, dy) {
    note.x = dragStart.x + dx
    note.y = dragStart.y + dy
  },
  end(dx, dy) {
    note.x = snap(note.x)
    note.y = snap(note.y)
    if (Math.hypot(dx, dy) < TAP_DISTANCE) onTap()
  },
})

const onResizeStart = useDrag({
  start() {
    dragStart = { x: note.width, y: note.height }
  },
  move(dx, dy) {
    note.width = Math.max(MIN_SIZE, dragStart.x + dx)
    note.height = Math.max(MIN_SIZE, dragStart.y + dy)
  },
  end() {
    note.width = snap(note.width)
    note.height = snap(note.height)
  },
})

function onPointerDown(e: PointerEvent) {
  if (!editing.value) onMoveStart(e)
}
</script>

<template>
  <div
    class="absolute flex rounded-sm bg-yellow-200 p-3 shadow-md"
    :class="editing ? 'cursor-auto' : 'cursor-move'"
    :style="{ left: `${note.x}px`, top: `${note.y}px`, width: `${note.width}px`, height: `${note.height}px` }"
    @pointerdown.stop="onPointerDown"
  >
    <textarea
      ref="textarea"
      v-model="note.text"
      aria-label="Notiztext"
      class="flex-1 resize-none bg-transparent text-base text-yellow-950 outline-none"
      :class="editing ? 'select-text' : 'pointer-events-none'"
      :readonly="!editing"
      @blur="editing = false"
      @keydown.esc="textarea?.blur()"
    />
    <div
      aria-label="Größe ändern"
      class="absolute right-0 bottom-0 size-4 cursor-nwse-resize rounded-tl-sm bg-yellow-400/60"
      @pointerdown.stop="onResizeStart"
    />
  </div>
</template>
