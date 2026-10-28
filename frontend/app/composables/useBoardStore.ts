import type { DeepReadonly } from 'vue'
import type { Attributes, BoardObject } from '~/types/board'

export type Bounds = Pick<BoardObject, 'x' | 'y' | 'width' | 'height'>

// The one place that holds all board objects. Everyone else gets them read-only
// and can change them only through the functions below.
export function useBoardStore() {
  const objects = useState<BoardObject[]>('board-objects', () => [createObject(TOOLS[0]!, 216, 216, 'Hello, board!')])

  function find(id: string) {
    return objects.value.find(o => o.id === id)
  }

  function addObject(tool: Tool, x: number, y: number) {
    const object = createObject(tool, x, y)
    objects.value.push(object)
    return object
  }

  // Adds a deep copy with a new id, shifted by (dx, dy).
  function addCopy(original: DeepReadonly<BoardObject>, dx: number, dy: number) {
    const copy: BoardObject = structuredClone(toRaw(original) as BoardObject)
    Object.assign(copy, { id: crypto.randomUUID(), x: original.x + dx, y: original.y + dy })
    objects.value.push(copy)
    return copy
  }

  function setBounds(id: string, bounds: Partial<Bounds>) {
    const object = find(id)
    if (object) Object.assign(object, bounds)
  }

  function setText(id: string, text: string) {
    const object = find(id)
    if (object && 'text' in object) object.text = text
  }

  // Changes one attribute, but only if the object has it.
  function setAttribute<K extends keyof Attributes>(id: string, key: K, value: Attributes[K]) {
    const object = find(id)
    if (object && key in object) Object.assign(object, { [key]: value })
  }

  function removeObject(id: string) {
    objects.value = objects.value.filter(o => o.id !== id)
  }

  return { objects: readonly(objects), addObject, addCopy, setBounds, setText, setAttribute, removeObject }
}
