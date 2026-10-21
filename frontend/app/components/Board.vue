<script setup lang="ts">
import { computed, reactive } from 'vue'
import { useDrag } from '~/composables/useDrag'
import { GRID } from '~/utils/grid'

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
      <PostIt />
    </div>
  </div>
</template>
