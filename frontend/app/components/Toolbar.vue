<script setup lang="ts">
const emit = defineEmits<{ add: [tool: Tool] }>()
</script>

<template>
  <div class="flex items-center gap-1 rounded-lg border bg-background p-1 shadow-sm">
    <button
      v-for="tool in TOOLS"
      :key="tool.label"
      class="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm hover:bg-accent"
      @click="emit('add', tool)"
    >
      <component :is="tool.icon" class="size-4" />
      {{ tool.label }}
    </button>
  </div>
</template>
