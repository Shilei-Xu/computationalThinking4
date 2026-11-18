import type { Board } from '~/types/board'

const NEW_BOARD_NAME = 'Unbenanntes Board'

// The list of boards, newest first. It is loaded once and then kept up to date locally.
export function useBoards() {
  const api = $fetch.create({ baseURL: useRuntimeConfig().public.apiBase })
  const boards = useState<Board[]>('boards', () => [])

  async function loadBoards() {
    boards.value = await api<Board[]>('/boards')
  }

  // Returns undefined if the board does not exist.
  async function findBoard(id: string) {
    try {
      return await api<Board>(`/boards/${id}`)
    }
    catch (error) {
      if ((error as { statusCode?: number }).statusCode === 404) return undefined
      throw error
    }
  }

  // Unlike the other changes, this waits for the backend,
  // so the board exists before anyone navigates to it.
  async function createBoard() {
    const board = await api<Board>('/boards', { method: 'POST', body: { id: crypto.randomUUID(), name: NEW_BOARD_NAME } })
    boards.value = [board, ...boards.value]
    return board
  }

  function renameBoard(id: string, name: string) {
    boards.value = boards.value.map(board => (board.id === id ? { ...board, name } : board))
    api(`/boards/${id}`, { method: 'PATCH', body: { name } })
  }

  function deleteBoard(id: string) {
    boards.value = boards.value.filter(board => board.id !== id)
    api(`/boards/${id}`, { method: 'DELETE' })
  }

  return { boards: readonly(boards), loadBoards, findBoard, createBoard, renameBoard, deleteBoard }
}
