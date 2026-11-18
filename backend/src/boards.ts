import { Hono } from 'hono'
import { deleteBoard, getBoard, insertBoard, insertObject, listBoards, listObjects, updateBoard } from './storage.js'

// REST routes for boards and for the objects on one board.
export const boards = new Hono()

function isName(value: unknown): value is string {
  return typeof value === 'string' && value.trim() !== ''
}

boards.get('/', async c => c.json(await listBoards()))

boards.post('/', async (c) => {
  const board = await c.req.json()
  if (typeof board.id !== 'string' || !isName(board.name)) return c.json({ error: 'Board needs an id and a name' }, 400)
  const inserted = await insertBoard(board)
  if (!inserted) return c.json({ error: 'A board with this id already exists' }, 409)
  return c.json(inserted, 201)
})

boards.get('/:id', async (c) => {
  const board = await getBoard(c.req.param('id'))
  if (!board) return c.json({ error: 'Board not found' }, 404)
  return c.json(board)
})

boards.patch('/:id', async (c) => {
  const { name } = await c.req.json()
  if (!isName(name)) return c.json({ error: 'Board needs a name' }, 400)
  const updated = await updateBoard(c.req.param('id'), name)
  if (!updated) return c.json({ error: 'Board not found' }, 404)
  return c.json(updated)
})

boards.delete('/:id', async (c) => {
  const deleted = await deleteBoard(c.req.param('id'))
  if (!deleted) return c.json({ error: 'Board not found' }, 404)
  return c.body(null, 204)
})

boards.get('/:id/objects', async (c) => {
  const id = c.req.param('id')
  if (!(await getBoard(id))) return c.json({ error: 'Board not found' }, 404)
  return c.json(await listObjects(id))
})

boards.post('/:id/objects', async (c) => {
  const id = c.req.param('id')
  if (!(await getBoard(id))) return c.json({ error: 'Board not found' }, 404)
  const object = await c.req.json()
  if (typeof object.id !== 'string') return c.json({ error: 'Object needs an id' }, 400)
  const inserted = await insertObject(id, object)
  if (!inserted) return c.json({ error: 'An object with this id already exists' }, 409)
  return c.json(inserted, 201)
})
