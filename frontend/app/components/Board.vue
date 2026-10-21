<script setup lang="ts">
import { useElementSize } from '@vueuse/core'
import { computed, onMounted, onUnmounted, ref, useTemplateRef } from 'vue'
import { useDrag } from '~/composables/useDrag'
import { usePinch } from '~/composables/usePinch'
import { useViewport } from '~/composables/useViewport'
import { GRID, snap } from '~/utils/grid'
import { NOTE_COLORS, NOTE_SIZE, type Note } from '~/utils/notes'

const ZOOM_STEP = 1.25
// Screen pixels: gap between note and menu, distance to screen edges,
// and the strip at the top that the toolbar covers.
const MENU_GAP = 8
const EDGE = 8
const TOOLBAR_SPACE = 72

// The board owns all notes. PostIt only displays one and reports changes back.
const notes = ref<Note[]>([])
const selectedId = ref<number | null>(null)
const selectedNote = computed(() => notes.value.find(n => n.id === selectedId.value))
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

function deleteSelected() {
  notes.value = notes.value.filter(n => n.id !== selectedId.value)
  selectedId.value = null
}

addNote(GRID * 5, GRID * 5, 'Neue Notiz')

const { view, zoomAt, toBoard, onWheel } = useViewport()
const canvas = useTemplateRef('canvas')
const menu = useTemplateRef('menu')
const screen = useElementSize(canvas)
const menuSize = useElementSize(() => menu.value?.$el, undefined, { box: 'border-box' })

function screenCenter() {
  return [screen.width.value / 2, screen.height.value / 2] as const
}

function addNoteInView() {
  const center = toBoard(...screenCenter())
  selectedId.value = addNote(center.x - NOTE_SIZE / 2, center.y - NOTE_SIZE / 2).id
}

let panStart = { x: 0, y: 0 }
const onPanStart = useDrag({
  start() {
    panStart = { x: view.x, y: view.y }
  },
  move(dx, dy) {
    view.x = panStart.x + dx
    view.y = panStart.y + dy
  },
  end(_dx, _dy, tap) {
    if (tap) selectedId.value = null
  },
})

const pinch = usePinch((scale, cx, cy, dx, dy) => {
  view.x += dx
  view.y += dy
  zoomAt(view.zoom * scale, cx, cy)
})

// Delete/Backspace removes the selected note, except while typing in a note.
function onKeydown(e: KeyboardEvent) {
  if (e.key !== 'Delete' && e.key !== 'Backspace') return
  if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) return
  if (selectedId.value !== null) deleteSelected()
}
onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))

// One dot per grid point. Each dot sits in the centre of its tile,
// so the pattern is shifted by half a tile to put dots on the grid points.
const gridStyle = computed(() => {
  const size = GRID * view.zoom
  return {
    backgroundImage: 'radial-gradient(circle, color-mix(in oklab, var(--muted-foreground) 40%, transparent) 1px, transparent 1.5px)',
    backgroundSize: `${size}px ${size}px`,
    backgroundPosition: `${view.x - size / 2}px ${view.y - size / 2}px`,
  }
})

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))

// The menu is drawn in screen space, so it keeps its size at every zoom level.
// It sits above the note if there is room below the toolbar, otherwise below it,
// and always stays fully on screen.
const menuStyle = computed(() => {
  const note = selectedNote.value
  if (!note) return
  const left = view.x + note.x * view.zoom
  const top = view.y + note.y * view.zoom
  const above = top - MENU_GAP - menuSize.height.value
  const below = top + note.height * view.zoom + MENU_GAP
  return {
    left: `${clamp(left, EDGE, screen.width.value - menuSize.width.value - EDGE)}px`,
    top: `${clamp(above >= TOOLBAR_SPACE ? above : below, TOOLBAR_SPACE, screen.height.value - menuSize.height.value - EDGE)}px`,
  }
})
</script>

<template>
  <div class="fixed inset-0 touch-none select-none overflow-hidden bg-background" @wheel.prevent="onWheel">
    <div
      ref="canvas"
      class="absolute inset-0 cursor-grab active:cursor-grabbing"
      :style="gridStyle"
      @pointerdown="onPanStart"
      @pointerdown.capture="pinch.down"
      @pointermove.capture="pinch.move"
      @pointerup.capture="pinch.up"
      @pointercancel.capture="pinch.up"
    >
      <div class="absolute top-0 left-0 origin-top-left" :style="{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.zoom})` }">
        <PostIt
          v-for="note in notes"
          :key="note.id"
          :note="note"
          :selected="note.id === selectedId"
          :zoom="view.zoom"
          @update="updateNote(note.id, $event)"
          @select="selectedId = note.id"
        />
      </div>
    </div>
    <NoteMenu
      v-if="selectedNote"
      ref="menu"
      :color="selectedNote.color"
      :style="menuStyle"
      @color="updateNote(selectedNote.id, { color: $event })"
      @delete="deleteSelected"
    />
    <Toolbar
      :zoom="view.zoom"
      @add="addNoteInView"
      @zoom-in="zoomAt(view.zoom * ZOOM_STEP, ...screenCenter())"
      @zoom-out="zoomAt(view.zoom / ZOOM_STEP, ...screenCenter())"
      @reset-zoom="zoomAt(1, ...screenCenter())"
    />
  </div>
</template>
