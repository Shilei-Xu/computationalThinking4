<script setup lang="ts">
import { Trash2 } from '@lucide/vue'
import type { DeepReadonly } from 'vue'
import type { Attributes, BoardObject } from '~/types/board'

// Screen pixels: gap to the object and minimum distance to the window edges.
const GAP = 8
const EDGE = 8

// Edits the selected object. It lives in screen space, so it keeps its size at every zoom level.
// `anchor` is the object's rectangle on screen; the board keeps it up to date.
const props = defineProps<{ object: DeepReadonly<BoardObject>, anchor: { left: number, top: number, bottom: number } }>()
const emit = defineEmits<{ change: [attribute: keyof Attributes, value: Attributes[keyof Attributes]], delete: [] }>()

const bar = useTemplateRef<HTMLElement>('bar')
// Local display state: the bar's own size and the window size, needed to keep it on screen.
const size = reactive({ width: 0, height: 0 })
const viewport = reactive({ width: 0, height: 0 })
const editors = computed(() => ATTRIBUTE_EDITORS.filter(e => e.attribute in props.object))

function valueOf(attribute: keyof Attributes) {
  return (props.object as DeepReadonly<Partial<Attributes>>)[attribute]
}

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))

// Above the object if there is room, otherwise below it, and always fully on screen.
// Hidden until measured: unmeasured, it would cover the object and catch the second click of a double-click.
const style = computed(() => {
  const above = props.anchor.top - GAP - size.height
  const top = above >= EDGE ? above : props.anchor.bottom + GAP
  return {
    left: `${clamp(props.anchor.left, EDGE, viewport.width - size.width - EDGE)}px`,
    top: `${clamp(top, EDGE, viewport.height - size.height - EDGE)}px`,
    visibility: size.height ? 'visible' as const : 'hidden' as const,
  }
})

function measureViewport() {
  viewport.width = window.innerWidth
  viewport.height = window.innerHeight
}

const observer = import.meta.client
  ? new ResizeObserver(() => {
      size.width = bar.value?.offsetWidth ?? 0
      size.height = bar.value?.offsetHeight ?? 0
    })
  : undefined

onMounted(() => {
  measureViewport()
  window.addEventListener('resize', measureViewport)
  observer?.observe(bar.value!)
})
onUnmounted(() => {
  window.removeEventListener('resize', measureViewport)
  observer?.disconnect()
})
</script>

<template>
  <div ref="bar" class="fixed z-20 flex items-center gap-1 rounded-lg border bg-background p-1 shadow-sm" :style="style">
    <template v-for="editor in editors" :key="editor.attribute">
      <div role="group" :aria-label="editor.label" class="flex items-center">
        <component :is="editor.component" :value="valueOf(editor.attribute)" @change="emit('change', editor.attribute, $event)" />
      </div>
      <div class="mx-1 h-6 w-px bg-border" />
    </template>
    <button
      title="Löschen"
      aria-label="Löschen"
      class="flex size-8 items-center justify-center rounded-md hover:bg-accent"
      @click="emit('delete')"
    >
      <Trash2 class="size-4" />
    </button>
  </div>
</template>
