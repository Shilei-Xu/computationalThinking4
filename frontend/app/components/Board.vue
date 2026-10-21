<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useDrag } from '~/composables/useDrag'
import { GRID, snap } from '~/utils/grid'
import { NOTE_COLORS, NOTE_SIZE, type Note } from '~/utils/notes'

// The board owns all notes. PostIt only displays one and reports changes back.
const notes = ref<Note[]>([])
const selectedId = ref<number | null>(null)
let nextId = 1

function addNote(x: number, y: number, text = '') {
  const note: Note = { id: nextId++, x: snap(x), y: snap(y), width: NOTE_SIZE, height: NOTE_SIZE, color: NOTE_COLORS[0]!.value, text }
  notes.value.push(note)
  return note
}

function updateNote(id: number, patch: Partial<Note>) {
  const note = notes.value.find(n => n.id === id)
  if (note) Object.assign(note, patch)
}

addNote(GRID * 5, GRID * 5, 'Neue Notiz')

// How far the canvas has been panned, in screen pixels.
const offset = reactive({ x: 0, y: 0 })
let panStart = { x: 0, y: 0 }

const onPanStart = useDrag({
  start() {
    panStart = { ...offset }
  },
  move(dx, dy) {
    offset.x = panStart.x + dx
    offset.y = panStart.y + dy
  },
  end(_dx, _dy, tap) {
    if (tap) selectedId.value = null
  },
})

// One dot per grid point. Each dot sits in the centre of its tile,
// so the pattern is shifted by half a tile to put dots on the grid points.
const gridStyle = computed(() => ({
  backgroundImage: 'radial-gradient(circle, color-mix(in oklab, var(--muted-foreground) 40%, transparent) 1px, transparent 1.5px)',
  backgroundSize: `${GRID}px ${GRID}px`,
  backgroundPosition: `${offset.x - GRID / 2}px ${offset.y - GRID / 2}px`,
}))
</script>

<template>
  <div
    class="fixed inset-0 cursor-grab touch-none select-none overflow-hidden bg-background active:cursor-grabbing"
    :style="gridStyle"
    @pointerdown="onPanStart"
  >
    <div class="absolute top-0 left-0" :style="{ transform: `translate(${offset.x}px, ${offset.y}px)` }">
      <PostIt
        v-for="note in notes"
        :key="note.id"
        :note="note"
        :selected="note.id === selectedId"
        :zoom="1"
        @update="updateNote(note.id, $event)"
        @select="selectedId = note.id"
      />
    </div>
  </div>
</template>
