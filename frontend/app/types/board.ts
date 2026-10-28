export type ObjectColor = 'yellow' | 'pink' | 'blue' | 'green' | 'orange'
export type BorderColor = 'dark' | 'blue' | 'red' | 'green'
export type ShapeType = 'circle' | 'star'

export interface Border { width: number, color: BorderColor }

// Every attribute an object can have. Each kind picks the ones that make sense for it,
// and the context bar shows an editor only for the attributes an object actually has.
export interface Attributes {
  color: ObjectColor
  fontSize: number
  bold: boolean
  border: Border
}

// Fields every object on the board has, whatever its kind.
interface BoardObjectBase {
  id: string
  x: number
  y: number
  width: number
  height: number
}

export interface PostIt extends BoardObjectBase, Pick<Attributes, 'color' | 'fontSize' | 'bold'> { kind: 'postit', text: string }
// Free text has no background, so there is nothing to colour.
export interface TextObject extends BoardObjectBase, Pick<Attributes, 'fontSize' | 'bold'> { kind: 'text', text: string }
// A pure shape without text. Circle and star are the same kind and differ only in `shape`.
export interface Shape extends BoardObjectBase, Pick<Attributes, 'color' | 'border'> { kind: 'shape', shape: ShapeType }

export type BoardObject = PostIt | TextObject | Shape
export type ObjectKind = BoardObject['kind']
