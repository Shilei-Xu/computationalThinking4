import { mkdir, readFile, writeFile } from 'node:fs/promises'

// The only place that knows where and how the board is stored.
// Routes call the functions below and never touch the file themselves.
const FILE = new URL('../data/board.json', import.meta.url)

export type BoardObject = { id: string } & Record<string, unknown>

async function readBoard(): Promise<BoardObject[]> {
  try {
    return JSON.parse(await readFile(FILE, 'utf8'))
  } catch {
    return []
  }
}

async function writeBoard(objects: BoardObject[]) {
  await mkdir(new URL('.', FILE), { recursive: true })
  await writeFile(FILE, JSON.stringify(objects, null, 2))
}

export async function listObjects() {
  return readBoard()
}

// Returns undefined if an object with this id already exists.
export async function insertObject(object: BoardObject) {
  const objects = await readBoard()
  if (objects.some(existing => existing.id === object.id)) return undefined
  await writeBoard([...objects, object])
  return object
}

export async function updateObject(id: string, changes: Record<string, unknown>) {
  const objects = await readBoard()
  const existing = objects.find(object => object.id === id)
  if (!existing) return undefined
  const updated: BoardObject = { ...existing, ...changes, id }
  await writeBoard(objects.map(object => (object.id === id ? updated : object)))
  return updated
}

export async function deleteObject(id: string) {
  const objects = await readBoard()
  const remaining = objects.filter(object => object.id !== id)
  if (remaining.length === objects.length) return false
  await writeBoard(remaining)
  return true
}
