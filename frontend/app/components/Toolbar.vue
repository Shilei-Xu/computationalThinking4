<script setup lang="ts">
import { Minus, Plus } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

defineProps<{ zoom: number }>()
const emit = defineEmits<{ add: [], zoomIn: [], zoomOut: [], resetZoom: [] }>()
</script>

<template>
  <div class="absolute top-4 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-lg border bg-background p-1 shadow-sm">
    <Button @click="emit('add')">
      <Plus /> Neue Notiz
    </Button>
    <Separator orientation="vertical" class="mx-1 h-6!" />
    <Button variant="ghost" size="icon" aria-label="Verkleinern" @click="emit('zoomOut')">
      <Minus />
    </Button>
    <Button variant="ghost" class="w-16 tabular-nums" aria-label="Zoom auf 100 % zurücksetzen" title="Zoom auf 100 % zurücksetzen" @click="emit('resetZoom')">
      {{ Math.round(zoom * 100) }} %
    </Button>
    <Button variant="ghost" size="icon" aria-label="Vergrößern" @click="emit('zoomIn')">
      <Plus />
    </Button>
  </div>
</template>
