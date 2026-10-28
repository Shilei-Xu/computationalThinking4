<script setup lang="ts">
import type { DeepReadonly } from 'vue'
import type { BoardObject } from '~/types/board'

type Corner = 'nw' | 'ne' | 'sw' | 'se'
export type Mode = 'move' | Corner

const HANDLE_CLASSES: Record<Corner, string> = {
  nw: 'left-0 top-0 cursor-nwse-resize',
  ne: 'left-full top-0 cursor-nesw-resize',
  sw: 'left-0 top-full cursor-nesw-resize',
  se: 'left-full top-full cursor-nwse-resize',
}

// Stateless: shows one object and reports what the user does. The board decides what changes.
const props = defineProps<{ object: DeepReadonly<BoardObject>, selected: boolean, editing: boolean }>()
const emit = defineEmits<{
  pointerdown: [event: PointerEvent, mode: Mode]
  edit: []
  input: [text: string]
  editEnd: []
  grow: [height: number]
}>()

const textarea = useTemplateRef<HTMLTextAreaElement>('textarea')
const content = useTemplateRef<HTMLElement>('content')
const type = computed(() => OBJECT_TYPES[props.object.kind])
const fill = computed(() => ('color' in props.object ? colorClass(props.object.color) : undefined))
// Shapes are drawn as an SVG outline, so the border follows the shape and not the bounding box.
const shape = computed(() => {
  const object = props.object
  if (!('shape' in object)) return null
  const { width, color } = object.border
  return { path: SHAPES[object.shape].path, fill: fillClass(object.color), stroke: strokeClass(color), width }
})
const textStyle = computed(() => ('fontSize' in props.object ? { fontSize: `${props.object.fontSize}px` } : undefined))
const bold = computed(() => 'bold' in props.object && props.object.bold)
// Shapes have no text, so they cannot be edited and never grow.
const text = computed(() => ('text' in props.object ? props.object.text : null))

watch(() => props.editing, async (editing) => {
  if (!editing) return
  await nextTick()
  textarea.value?.focus()
  textarea.value?.select()
})

// Reports the height up to the next grid line when the text no longer fits.
async function fitToContent() {
  await nextTick()
  const element = textarea.value ?? content.value
  if (!element) return
  const needed = Math.ceil(element.scrollHeight / GRID_SIZE) * GRID_SIZE
  if (needed > props.object.height) emit('grow', needed)
}

watch(() => [text.value, textStyle.value, bold.value, props.object.width, props.object.height, props.editing], fitToContent)
onMounted(fitToContent)
</script>

<template>
  <div
    class="absolute text-lg touch-none"
    :class="[selected ? 'ring-2 ring-blue-300' : '', editing ? 'cursor-text' : 'cursor-move']"
    :style="{ left: `${object.x}px`, top: `${object.y}px`, width: `${object.width}px`, height: `${object.height}px` }"
    @pointerdown.stop="emit('pointerdown', $event, 'move')"
    @dblclick="emit('edit')"
  >
    <div v-if="type.background" class="absolute inset-0 drop-shadow-md">
      <div class="size-full" :class="[type.background.class, fill]" />
    </div>
    <svg
      v-if="shape"
      class="absolute inset-0 size-full overflow-visible drop-shadow-md"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <path
        :d="shape.path"
        :class="[shape.fill, shape.stroke]"
        :stroke-width="shape.width"
        stroke-linejoin="round"
        vector-effect="non-scaling-stroke"
      />
    </svg>
    <textarea
      v-if="text !== null && editing"
      ref="textarea"
      class="relative size-full bg-transparent resize-none outline-none"
      :class="[type.text?.class, bold && 'font-bold']"
      :style="textStyle"
      :placeholder="type.text?.placeholder"
      :value="text"
      @input="emit('input', ($event.target as HTMLTextAreaElement).value)"
      @blur="emit('editEnd')"
      @keydown.escape="emit('editEnd')"
    />
    <div
      v-else-if="text !== null"
      ref="content"
      class="relative size-full overflow-hidden whitespace-pre-wrap break-words select-none"
      :class="[type.text?.class, bold && 'font-bold', text ? '' : 'text-muted-foreground']"
      :style="textStyle"
    >
      {{ text || type.text?.placeholder }}
    </div>

    <template v-if="selected && !editing">
      <div
        v-for="(classes, corner) in HANDLE_CLASSES"
        :key="corner"
        class="absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-sm border-2 border-blue-500 bg-background"
        :class="classes"
        @pointerdown.stop="emit('pointerdown', $event, corner)"
      />
    </template>
  </div>
</template>
