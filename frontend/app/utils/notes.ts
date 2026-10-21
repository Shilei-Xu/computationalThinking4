import { GRID } from '~/utils/grid'

export type NoteColor = 'yellow' | 'pink' | 'blue' | 'green' | 'orange'

export type Note = {
  id: number
  x: number
  y: number
  width: number
  height: number
  color: NoteColor
  text: string
}

// Classic post-it colors. All of them are light on purpose: the note text is
// always dark, so it stays readable on every color, whatever the page theme.
export const NOTE_COLORS: { value: NoteColor, label: string, class: string }[] = [
  { value: 'yellow', label: 'Gelb', class: 'bg-yellow-200' },
  { value: 'pink', label: 'Rosa', class: 'bg-pink-200' },
  { value: 'blue', label: 'Blau', class: 'bg-sky-200' },
  { value: 'green', label: 'Grün', class: 'bg-lime-200' },
  { value: 'orange', label: 'Orange', class: 'bg-orange-200' },
]

export const NOTE_SIZE = GRID * 8
export const MIN_NOTE_SIZE = GRID * 4
