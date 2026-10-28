import { Circle, Star, StickyNote, Type } from '@lucide/vue'
import type { Component } from 'vue'
import type { BoardObject, ObjectKind, ShapeType } from '~/types/board'

interface ObjectType {
  width: number
  height: number
  // Coloured square behind the text. Free text has none; shapes draw theirs from SHAPES.
  background?: { class: string }
  // Only kinds with editable text have this.
  text?: { class: string, placeholder: string }
}

// Everything that differs between kinds lives here, so the board itself stays generic.
export const OBJECT_TYPES: Record<ObjectKind, ObjectType> = {
  postit: {
    width: GRID_SIZE * 8, height: GRID_SIZE * 8,
    background: { class: '' }, text: { class: 'p-4', placeholder: 'Post-it' },
  },
  text: {
    width: GRID_SIZE * 8, height: GRID_SIZE * 3,
    text: { class: 'p-1', placeholder: 'Text' },
  },
  shape: { width: GRID_SIZE * 8, height: GRID_SIZE * 8 },
}

// SVG outlines in a 0–100 box, stretched to the object's size.
export const SHAPES: Record<ShapeType, { path: string }> = {
  circle: { path: 'M50 0A50 50 0 1 1 50 100A50 50 0 1 1 50 0Z' },
  star: { path: 'M50 0L61 35L98 35L68 57L79 91L50 70L21 91L32 57L2 35L39 35Z' },
}

// The buttons in the toolbar. Kreis and Stern both create a Shape, only its `shape` differs.
export type Tool = { label: string, icon: Component } & (
  | { kind: 'postit' | 'text' }
  | { kind: 'shape', shape: ShapeType }
)

export const TOOLS: Tool[] = [
  { label: 'Post-it', icon: StickyNote, kind: 'postit' },
  { label: 'Text', icon: Type, kind: 'text' },
  { label: 'Kreis', icon: Circle, kind: 'shape', shape: 'circle' },
  { label: 'Stern', icon: Star, kind: 'shape', shape: 'star' },
]

// Creates the object a tool stands for, centred on the board point (x, y).
export function createObject(tool: Tool, x: number, y: number, text = ''): BoardObject {
  const { width, height } = OBJECT_TYPES[tool.kind]
  const base = { id: crypto.randomUUID(), x: snapToGrid(x - width / 2), y: snapToGrid(y - height / 2), width, height }
  switch (tool.kind) {
    case 'postit': return { ...base, kind: 'postit', text, color: 'yellow', fontSize: 18, bold: false }
    case 'text': return { ...base, kind: 'text', text, fontSize: 18, bold: false }
    case 'shape': return { ...base, kind: 'shape', shape: tool.shape, color: 'yellow', border: { width: 2, color: 'dark' } }
  }
}
