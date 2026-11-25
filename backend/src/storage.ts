import { createClient } from '@supabase/supabase-js'

// The backend treats objects as plain JSON; it only relies on every object having an id.
export type BoardObject = { id: string } & Record<string, unknown>
export type Board = { id: string; name: string; createdAt: string }
export type Member = { id: string; name: string; avatarUrl?: string }
export type BoardWithMembers = Board & { members: Member[] }
export type Profile = Member & { email: string }

// This module is the only place that knows about the database.
// The secret key stays in the backend; it must never reach the browser.
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!)

// Postgres reports this code when a primary key already exists.
const DUPLICATE_KEY = '23505'

// Field names the frontend uses that are named differently in the tables.
const COLUMNS: Record<string, string> = { fontSize: 'font_size', createdAt: 'created_at' }
const FIELDS = Object.fromEntries(Object.entries(COLUMNS).map(([field, column]) => [column, field]))

function toRow(object: Record<string, unknown>) {
  return Object.fromEntries(Object.entries(object).map(([key, value]) => [COLUMNS[key] ?? key, value]))
}

// Columns a variant does not have are empty (null) in the table; the frontend expects them to be missing.
function fromRow(row: Record<string, unknown>) {
  const fields = Object.entries(row).filter(([, value]) => value !== null)
  return Object.fromEntries(fields.map(([key, value]) => [FIELDS[key] ?? key, value]))
}

// The frontend already knows which board an object belongs to and draws them in list order.
function fromObjectRow({ board_id, created_at, ...row }: Record<string, unknown>) {
  return fromRow(row) as BoardObject
}

// A board together with the profiles of all its members (board_members links the two tables).
const BOARD_WITH_MEMBERS = 'id, name, created_at, members:board_members(profiles(id, name, avatar_url))'

function fromMemberRow({ id, name, avatar_url }: Record<string, unknown>) {
  return (avatar_url ? { id, name, avatarUrl: avatar_url } : { id, name }) as Member
}

function fromBoardWithMembersRow({ members, mine, ...row }: Record<string, unknown>) {
  const profiles = (members as { profiles: Record<string, unknown> }[]).map(member => fromMemberRow(member.profiles))
  return { ...(fromRow(row) as Board), members: profiles }
}

// Only the boards the user is a member of, but each with all of its members:
// "mine" is a second, filtering join that keeps a board only if the user is among its members.
export async function listBoards(userId: string) {
  const { data, error } = await supabase
    .from('boards')
    .select(`${BOARD_WITH_MEMBERS}, mine:board_members!inner(user_id)`)
    .eq('mine.user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data.map(fromBoardWithMembersRow)
}

export async function getBoard(id: string) {
  const { data, error } = await supabase.from('boards').select().eq('id', id).maybeSingle()
  if (error) throw new Error(error.message)
  return data ? (fromRow(data) as Board) : undefined
}

// The creator becomes the first member. Returns undefined if a board with this id already exists.
// Two separate inserts: if the second one fails, the board exists without members.
export async function insertBoard(board: Pick<Board, 'id' | 'name'>, userId: string) {
  const { error } = await supabase.from('boards').insert(board)
  if (error?.code === DUPLICATE_KEY) return undefined
  if (error) throw new Error(error.message)
  await addMember(board.id, userId)
  const { data, error: selectError } = await supabase.from('boards').select(BOARD_WITH_MEMBERS).eq('id', board.id).single()
  if (selectError) throw new Error(selectError.message)
  return fromBoardWithMembersRow(data)
}

export async function isMember(boardId: string, userId: string) {
  const { data, error } = await supabase.from('board_members').select().eq('board_id', boardId).eq('user_id', userId)
  if (error) throw new Error(error.message)
  return data.length > 0
}

// Adding someone who is already a member changes nothing.
export async function addMember(boardId: string, userId: string) {
  const { error } = await supabase
    .from('board_members')
    .upsert({ board_id: boardId, user_id: userId }, { ignoreDuplicates: true })
  if (error) throw new Error(error.message)
}

// Written at every login, so name and avatar stay up to date. Emails are compared in lowercase.
export async function upsertProfile({ id, email, name, avatarUrl }: Profile) {
  const { error } = await supabase.from('profiles').upsert({ id, email: email.toLowerCase(), name, avatar_url: avatarUrl ?? null })
  if (error) throw new Error(error.message)
}

// Returns undefined if nobody with this email has ever logged in.
export async function findProfileByEmail(email: string) {
  const { data, error } = await supabase.from('profiles').select().eq('email', email.trim().toLowerCase()).maybeSingle()
  if (error) throw new Error(error.message)
  return data ? fromMemberRow(data) : undefined
}

export async function renameBoard(id: string, name: string) {
  const { data, error } = await supabase.from('boards').update({ name }).eq('id', id).select().maybeSingle()
  if (error) throw new Error(error.message)
  return data ? (fromRow(data) as Board) : undefined
}

// The database deletes the objects on the board as well (on delete cascade).
export async function deleteBoard(id: string) {
  const { data, error } = await supabase.from('boards').delete().eq('id', id).select()
  if (error) throw new Error(error.message)
  return data.length > 0
}

export async function listObjects(boardId: string) {
  // Oldest first, so newer objects are drawn on top.
  const { data, error } = await supabase.from('objects').select().eq('board_id', boardId).order('created_at')
  if (error) throw new Error(error.message)
  return data.map(fromObjectRow)
}

// Returns undefined if an object with this id already exists.
export async function insertObject(boardId: string, object: BoardObject) {
  const { data, error } = await supabase.from('objects').insert({ ...toRow(object), board_id: boardId }).select().single()
  if (error?.code === DUPLICATE_KEY) return undefined
  if (error) throw new Error(error.message)
  return fromObjectRow(data)
}

export async function updateObject(id: string, { id: _ignored, ...changes }: Record<string, unknown>) {
  const { data, error } = await supabase.from('objects').update(toRow(changes)).eq('id', id).select().maybeSingle()
  if (error) throw new Error(error.message)
  return data ? fromObjectRow(data) : undefined
}

export async function deleteObject(id: string) {
  const { data, error } = await supabase.from('objects').delete().eq('id', id).select()
  if (error) throw new Error(error.message)
  return data.length > 0
}
