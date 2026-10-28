<script setup lang="ts">
import type { DeepReadonly } from 'vue'
import type { Mode } from '~/components/BoardItem.vue'
import type InfiniteCanvas from '~/components/InfiniteCanvas.vue'
import type { BoardObject } from '~/types/board'

const MIN_SIZE = GRID_SIZE * 3

// The objects live in the central store and change only through its functions.
const { objects, addObject, addCopy, setBounds, setText, setAttribute, removeObject } = useBoardStore()

// Local UI state: what is selected or being edited is not part of the board's content.
const selectedId = ref<string | null>(null)
const editingId = ref<string | null>(null)
const selected = computed(() => objects.value.find(o => o.id === selectedId.value))
const canvas = useTemplateRef<InstanceType<typeof InfiniteCanvas>>('canvas')
// Internal clipboard for ⌘C/⌘X/⌘V. A snapshot, so later changes to the original do not leak in.
let clipboard: BoardObject | null = null

// The selected object's rectangle in screen pixels. It follows moving, resizing, panning and zooming.
const anchor = computed(() => {
  const object = selected.value
  if (!object || !canvas.value) return null
  const { offset, scale } = canvas.value
  const left = offset.x + object.x * scale
  const top = offset.y + object.y * scale
  return { left, top, bottom: top + object.height * scale }
})

let interaction: { id: string; mode: Mode; startX: number; startY: number; start: Bounds } | null = null

function add(tool: Tool) {
  const { x, y } = canvas.value!.center()
  selectedId.value = addObject(tool, x, y).id
}

function remove() {
  if (selectedId.value) removeObject(selectedId.value)
  selectedId.value = null
}

function startEditing(object: DeepReadonly<BoardObject>) {
  if ('text' in object) editingId.value = object.id
}

// Resizing from a north or west corner moves the object so the opposite corner stays put.
function nextRect(mode: Mode, start: Bounds, dx: number, dy: number): Partial<Bounds> {
  if (mode === 'move') return { x: snapToGrid(start.x + dx), y: snapToGrid(start.y + dy) }
  const width = Math.max(MIN_SIZE, snapToGrid(start.width + (mode.endsWith('e') ? dx : -dx)))
  const height = Math.max(MIN_SIZE, snapToGrid(start.height + (mode.startsWith('s') ? dy : -dy)))
  return {
    width,
    height,
    x: mode.endsWith('w') ? start.x + start.width - width : start.x,
    y: mode.startsWith('n') ? start.y + start.height - height : start.y,
  }
}

function startInteraction(object: DeepReadonly<BoardObject>, event: PointerEvent, mode: Mode) {
  selectedId.value = object.id
  if (editingId.value === object.id) return
  const { x, y, width, height } = object
  interaction = { id: object.id, mode, startX: event.clientX, startY: event.clientY, start: { x, y, width, height } }
  ;(event.target as Element).setPointerCapture(event.pointerId)
  window.addEventListener('pointermove', onPointerMove)
  window.addEventListener('pointerup', onPointerUp)
}

// Pointer distances are in screen pixels; dividing by the zoom turns them into board units.
function onPointerMove(event: PointerEvent) {
  if (!interaction) return
  const scale = canvas.value!.scale
  const dx = (event.clientX - interaction.startX) / scale
  const dy = (event.clientY - interaction.startY) / scale
  setBounds(interaction.id, nextRect(interaction.mode, interaction.start, dx, dy))
}

function onPointerUp() {
  interaction = null
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerup', onPointerUp)
}

function select(object: BoardObject) {
  selectedId.value = object.id
}

function snapshot(object: DeepReadonly<BoardObject>): BoardObject {
  return structuredClone(toRaw(object) as BoardObject)
}

function moveBy(dx: number, dy: number) {
  const object = selected.value
  if (object) setBounds(object.id, { x: object.x + dx, y: object.y + dy })
}

// What each entry of SHORTCUTS does. Everything except paste needs a selected object.
const commands: Record<Command, () => void> = {
  copy: () => { if (selected.value) clipboard = snapshot(selected.value) },
  cut: () => { if (selected.value) { clipboard = snapshot(selected.value); remove() } },
  paste: () => { if (clipboard) { const copy = addCopy(clipboard, GRID_SIZE, GRID_SIZE); clipboard = snapshot(copy); select(copy) } },
  duplicate: () => { if (selected.value) select(addCopy(selected.value, GRID_SIZE, GRID_SIZE)) },
  delete: remove,
  deselect: () => { selectedId.value = null },
  left: () => moveBy(-GRID_SIZE, 0),
  right: () => moveBy(GRID_SIZE, 0),
  up: () => moveBy(0, -GRID_SIZE),
  down: () => moveBy(0, GRID_SIZE),
}

// While text is being edited, no shortcut is handled at all, so the browser's own
// text shortcuts (copy, paste, delete a character, move the caret) keep working.
function isTyping(event: KeyboardEvent) {
  const target = event.target as HTMLElement
  return editingId.value !== null || event.isComposing
    || target instanceof HTMLTextAreaElement || target instanceof HTMLInputElement || target.isContentEditable
}

function onKeydown(event: KeyboardEvent) {
  if (isTyping(event)) return
  const command = findCommand(event)
  if (!command) return
  event.preventDefault()
  commands[command]()
}
onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <InfiniteCanvas ref="canvas" @pointerdown="selectedId = null">
    <BoardItem
      v-for="object in objects"
      :key="object.id"
      :object="object"
      :selected="object.id === selectedId"
      :editing="object.id === editingId"
      @pointerdown="(event, mode) => startInteraction(object, event, mode)"
      @edit="startEditing(object)"
      @input="setText(object.id, $event)"
      @edit-end="editingId = null"
      @grow="setBounds(object.id, { height: $event })"
    />
  </InfiniteCanvas>
  <ContextBar
    v-if="selected && anchor"
    :object="selected"
    :anchor="anchor"
    @change="(attribute, value) => setAttribute(selected!.id, attribute, value)"
    @delete="remove"
  />
  <div class="fixed bottom-4 left-1/2 -translate-x-1/2">
    <Toolbar @add="add" />
  </div>
</template>
