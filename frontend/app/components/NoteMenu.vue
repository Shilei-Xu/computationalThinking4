<script setup lang="ts">
import { Trash2 } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { NOTE_COLORS, type NoteColor } from '~/utils/notes'

// Color picker and delete button shown above the selected note.
defineProps<{ color: NoteColor }>()
const emit = defineEmits<{ color: [color: NoteColor], delete: [] }>()

function onColor(value: unknown) {
  // A single toggle group reports an empty value when the active item is clicked again; keep the color then.
  if (value) emit('color', value as NoteColor)
}
</script>

<template>
  <div class="absolute flex items-center gap-1 rounded-lg border bg-background p-1 shadow-sm">
    <ToggleGroup type="single" :model-value="color" aria-label="Farbe" @update:model-value="onColor">
      <ToggleGroupItem v-for="c in NOTE_COLORS" :key="c.value" :value="c.value" :aria-label="c.label" :title="c.label">
        <span class="size-5 rounded-full border border-black/15" :class="c.class" />
      </ToggleGroupItem>
    </ToggleGroup>
    <Separator orientation="vertical" class="mx-1 h-6!" />
    <Button variant="ghost" size="icon" aria-label="Notiz löschen" title="Notiz löschen" @click="emit('delete')">
      <Trash2 />
    </Button>
  </div>
</template>
