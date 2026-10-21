<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { useDrag } from '~/composables/useDrag'
import { snap } from '~/utils/grid'
import { MIN_NOTE_SIZE, NOTE_COLORS, type Note } from '~/utils/notes'

const DOUBLE_TAP_MS = 300

// Displays one note. The board owns the note; every change is reported back via `update`.
const props = defineProps<{ note: Note, selected: boolean, zoom: number }>()
const emit = defineEmits<{ update: [patch: Partial<Note>], select: [] }>()

const editing = ref(false)
const textarea = ref<HTMLTextAreaElement>()
const colorClass = computed(() => NOTE_COLORS.find(c => c.value === props.note.color)?.class)
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

// Pointer distances are in screen pixels; dividing by the zoom turns them into board units.
const onMoveStart = useDrag({
  start() {
    emit('select')
    dragStart = { x: props.note.x, y: props.note.y }
  },
  move(dx, dy) {
    emit('update', { x: dragStart.x + dx / props.zoom, y: dragStart.y + dy / props.zoom })
  },
  end(_dx, _dy, tap) {
    emit('update', { x: snap(props.note.x), y: snap(props.note.y) })
    if (tap) onTap()
  },
})

const onResizeStart = useDrag({
  start() {
    emit('select')
    dragStart = { x: props.note.width, y: props.note.height }
  },
  move(dx, dy) {
    emit('update', {
      width: Math.max(MIN_NOTE_SIZE, dragStart.x + dx / props.zoom),
      height: Math.max(MIN_NOTE_SIZE, dragStart.y + dy / props.zoom),
    })
  },
  end() {
    emit('update', { width: snap(props.note.width), height: snap(props.note.height) })
  },
})

function onPointerDown(e: PointerEvent) {
  if (!editing.value) onMoveStart(e)
}
</script>

<template>
  <div
    class="absolute flex rounded-sm p-3 shadow-md"
    :class="[colorClass, editing ? 'cursor-auto' : 'cursor-move', selected && 'z-10 ring-3 ring-sky-500 ring-offset-2 ring-offset-background']"
    :style="{ left: `${note.x}px`, top: `${note.y}px`, width: `${note.width}px`, height: `${note.height}px` }"
    @pointerdown.stop="onPointerDown"
  >
    <textarea
      ref="textarea"
      :value="note.text"
      aria-label="Notiztext"
      placeholder="Doppelklick zum Schreiben"
      class="flex-1 resize-none bg-transparent text-base text-neutral-900 outline-none placeholder:text-neutral-500"
      :class="editing ? 'select-text' : 'pointer-events-none'"
      :readonly="!editing"
      @input="emit('update', { text: ($event.target as HTMLTextAreaElement).value })"
      @blur="editing = false"
      @keydown.esc="textarea?.blur()"
    />
    <div
      aria-label="Größe ändern"
      class="absolute right-0 bottom-0 size-4 cursor-nwse-resize rounded-tl-sm bg-black/10"
      @pointerdown.stop="onResizeStart"
    />
  </div>
</template>
