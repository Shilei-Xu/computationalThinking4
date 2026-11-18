import { createClient } from '@supabase/supabase-js'

// The backend treats objects as plain JSON; it only relies on every object having an id.
export type BoardObject = { id: string } & Record<string, unknown>
export type Board = { id: string; name: string }

// The backend is started without an env loader, so this module reads backend/.env itself.
process.loadEnvFile(new URL('../.env', import.meta.url).pathname)

// The secret key is only used here on the server; it must never reach the frontend.
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!)

// Postgres error code for a duplicate primary key.
const UNIQUE_VIOLATION = '23505'

// The frontend uses camelCase, the table uses snake_case. Only fontSize differs.
function toRow(object: Record<string, unknown>) {
  const { fontSize, ...rest } = object
  return fontSize === undefined ? rest : { ...rest, font_size: fontSize }
}

// Turn a row back into the shape the frontend sent: no created_at, no board_id, no empty columns.
function toObject(row: Record<string, unknown>): BoardObject {
  const { font_size, created_at, board_id, ...rest } = row
  const object = Object.fromEntries(Object.entries({ ...rest, fontSize: font_size }).filter(([, value]) => value !== null))
  return object as BoardObject
}

export async function listBoards() {
  const { data, error } = await supabase.from('boards').select('id, name').order('created_at', { ascending: false })
  if (error) throw error
  return data as Board[]
}

export async function getBoard(id: string) {
  const { data, error } = await supabase.from('boards').select('id, name').eq('id', id).maybeSingle()
  if (error) throw error
  return (data ?? undefined) as Board | undefined
}

// Returns undefined if a board with this id already exists.
export async function insertBoard(board: Board) {
  const { data, error } = await supabase.from('boards').insert({ id: board.id, name: board.name }).select('id, name').single()
  if (error?.code === UNIQUE_VIOLATION) return undefined
  if (error) throw error
  return data as Board
}

export async function updateBoard(id: string, name: string) {
  const { data, error } = await supabase.from('boards').update({ name }).eq('id', id).select('id, name').maybeSingle()
  if (error) throw error
  return (data ?? undefined) as Board | undefined
}

// Postgres deletes the board's objects along with it (on delete cascade).
export async function deleteBoard(id: string) {
  const { data, error } = await supabase.from('boards').delete().eq('id', id).select('id')
  if (error) throw error
  return data.length > 0
}

export async function listObjects(boardId: string) {
  const { data, error } = await supabase.from('objects').select().eq('board_id', boardId).order('created_at')
  if (error) throw error
  return data.map(toObject)
}

// Returns undefined if an object with this id already exists.
export async function insertObject(boardId: string, object: BoardObject) {
  const { data, error } = await supabase.from('objects').insert({ ...toRow(object), board_id: boardId }).select().single()
  if (error?.code === UNIQUE_VIOLATION) return undefined
  if (error) throw error
  return toObject(data)
}

export async function updateObject(id: string, changes: Record<string, unknown>) {
  const { data, error } = await supabase.from('objects').update(toRow({ ...changes, id })).eq('id', id).select().maybeSingle()
  if (error) throw error
  return data ? toObject(data) : undefined
}

export async function deleteObject(id: string) {
  const { data, error } = await supabase.from('objects').delete().eq('id', id).select()
  if (error) throw error
  return data.length > 0
}
