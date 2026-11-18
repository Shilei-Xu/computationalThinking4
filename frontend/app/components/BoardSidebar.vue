<script setup lang="ts">
import { PanelLeft, Plus } from '@lucide/vue'
import type { Board } from '~/types/board'

const route = useRoute()
const { boards, loadBoards, createBoard, renameBoard, deleteBoard } = useBoards()
onMounted(() => callOnce('boards', loadBoards))

const open = ref(true)
const editingId = ref<string | null>(null)
// The board stays set while the dialog closes, so its name does not vanish mid-animation.
const toDelete = ref<Board | null>(null)
const confirmOpen = ref(false)

// A new board opens straight away, with its name ready to be typed over.
async function onCreate() {
  const board = await createBoard()
  await navigateTo(`/boards/${board.id}`)
  editingId.value = board.id
}

function onRename(board: Board, name: string) {
  editingId.value = null
  const trimmed = name.trim()
  if (trimmed && trimmed !== board.name) renameBoard(board.id, trimmed)
}

function askDelete(board: Board) {
  toDelete.value = board
  confirmOpen.value = true
}

// Deleting the open board leads to "/", which picks the newest remaining board.
function onDelete() {
  const board = toDelete.value!
  deleteBoard(board.id)
  if (board.id === route.params.id) navigateTo('/')
}
</script>

<template>
  <div class="fixed top-4 left-4 z-20">
    <Button
      v-if="!open"
      variant="outline"
      size="icon-lg"
      class="rounded-xl bg-white shadow-lg"
      aria-label="Show boards"
      @click="open = true"
    >
      <PanelLeft />
    </Button>
    <nav v-else class="flex max-h-[calc(100vh-2rem)] w-64 flex-col gap-1 rounded-2xl border bg-white p-2 shadow-xl">
      <div class="flex items-center justify-between pl-2">
        <span class="text-sm font-semibold">Boards</span>
        <Button variant="ghost" size="icon-sm" aria-label="Hide boards" @click="open = false">
          <PanelLeft />
        </Button>
      </div>
      <Button variant="ghost" class="justify-start" @click="onCreate">
        <Plus /> Neues Board
      </Button>
      <ul class="flex flex-col gap-0.5 overflow-y-auto">
        <BoardListItem
          v-for="board in boards"
          :key="board.id"
          :board="board"
          :active="board.id === route.params.id"
          :editing="board.id === editingId"
          @edit="editingId = board.id"
          @rename="name => onRename(board, name)"
          @delete="askDelete(board)"
        />
      </ul>
    </nav>
  </div>

  <AlertDialog v-model:open="confirmOpen">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>„{{ toDelete?.name }}“ und alle Objekte darauf löschen?</AlertDialogTitle>
        <AlertDialogDescription>Das lässt sich nicht rückgängig machen.</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Abbrechen</AlertDialogCancel>
        <AlertDialogAction variant="destructive" @click="onDelete">Löschen</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
