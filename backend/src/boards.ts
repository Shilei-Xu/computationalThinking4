import { Hono } from 'hono'
import { currentUser } from './auth.js'
import { addMember, deleteBoard, findProfileByEmail, getBoard, insertBoard, insertObject, isMember, listBoards, listObjects, renameBoard } from './storage.js'

// REST routes for the boards and for the objects on one board.
// Only listing, creating and adding members ask who is logged in; the other routes check nobody yet.
export const boards = new Hono()

boards.get('/', async (c) => {
  const user = await currentUser(c)
  if (!user) return c.json({ error: 'Not logged in' }, 401)
  return c.json(await listBoards(user.id))
})

boards.post('/', async (c) => {
  const user = await currentUser(c)
  if (!user) return c.json({ error: 'Not logged in' }, 401)
  const { id, name } = await c.req.json()
  if (typeof id !== 'string' || typeof name !== 'string') return c.json({ error: 'Board needs an id and a name' }, 400)
  const board = await insertBoard({ id, name }, user.id)
  if (!board) return c.json({ error: 'A board with this id already exists' }, 409)
  return c.json(board, 201)
})

// Adds someone who has logged in before, found by email. Only members may add others.
boards.post('/:id/members', async (c) => {
  const user = await currentUser(c)
  if (!user) return c.json({ error: 'Not logged in' }, 401)
  const { email } = await c.req.json()
  if (typeof email !== 'string') return c.json({ error: 'Member needs an email' }, 400)
  const boardId = c.req.param('id')
  if (!(await getBoard(boardId))) return c.json({ error: 'Board not found' }, 404)
  if (!(await isMember(boardId, user.id))) return c.json({ error: 'Only members can add others' }, 403)
  const member = await findProfileByEmail(email)
  if (!member) return c.json({ error: 'Nobody with this email has logged in yet' }, 404)
  await addMember(boardId, member.id)
  return c.json(member, 201)
})

boards.get('/:id', async (c) => {
  const board = await getBoard(c.req.param('id'))
  if (!board) return c.json({ error: 'Board not found' }, 404)
  return c.json(board)
})

boards.patch('/:id', async (c) => {
  const { name } = await c.req.json()
  if (typeof name !== 'string') return c.json({ error: 'Board needs a name' }, 400)
  const board = await renameBoard(c.req.param('id'), name)
  if (!board) return c.json({ error: 'Board not found' }, 404)
  return c.json(board)
})

boards.delete('/:id', async (c) => {
  const deleted = await deleteBoard(c.req.param('id'))
  if (!deleted) return c.json({ error: 'Board not found' }, 404)
  return c.body(null, 204)
})

boards.get('/:id/objects', async (c) => {
  const boardId = c.req.param('id')
  if (!(await getBoard(boardId))) return c.json({ error: 'Board not found' }, 404)
  return c.json(await listObjects(boardId))
})

boards.post('/:id/objects', async (c) => {
  const boardId = c.req.param('id')
  const object = await c.req.json()
  if (typeof object.id !== 'string') return c.json({ error: 'Object needs an id' }, 400)
  if (!(await getBoard(boardId))) return c.json({ error: 'Board not found' }, 404)
  const created = await insertObject(boardId, object)
  if (!created) return c.json({ error: 'An object with this id already exists' }, 409)
  return c.json(created, 201)
})
