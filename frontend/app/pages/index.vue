<script setup lang="ts">
// "/" always leads to a board: the newest one, or a new one if there is none.
const { boards, loadBoards, createBoard } = useBoards()
await callOnce('boards', loadBoards)
const board = boards.value[0] ?? await createBoard()
await navigateTo(`/boards/${board.id}`, { replace: true })
</script>

<template>
  <div />
</template>
