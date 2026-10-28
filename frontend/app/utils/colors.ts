import type { BorderColor, ObjectColor } from '~/types/board'

// `class` colours a background (post-it, swatch), `fill` colours an SVG shape.
export const OBJECT_COLORS: { value: ObjectColor, label: string, class: string, fill: string }[] = [
  { value: 'yellow', label: 'Gelb', class: 'bg-yellow-200', fill: 'fill-yellow-200' },
  { value: 'pink', label: 'Rosa', class: 'bg-pink-200', fill: 'fill-pink-200' },
  { value: 'blue', label: 'Blau', class: 'bg-sky-200', fill: 'fill-sky-200' },
  { value: 'green', label: 'Grün', class: 'bg-lime-200', fill: 'fill-lime-200' },
  { value: 'orange', label: 'Orange', class: 'bg-orange-200', fill: 'fill-orange-200' },
]

export const BORDER_COLORS: { value: BorderColor, label: string, swatch: string, stroke: string }[] = [
  { value: 'dark', label: 'Dunkel', swatch: 'bg-neutral-800', stroke: 'stroke-neutral-800' },
  { value: 'blue', label: 'Blau', swatch: 'bg-sky-600', stroke: 'stroke-sky-600' },
  { value: 'red', label: 'Rot', swatch: 'bg-rose-600', stroke: 'stroke-rose-600' },
  { value: 'green', label: 'Grün', swatch: 'bg-lime-600', stroke: 'stroke-lime-600' },
]

export function colorClass(color: ObjectColor) {
  return OBJECT_COLORS.find(c => c.value === color)?.class
}

export function fillClass(color: ObjectColor) {
  return OBJECT_COLORS.find(c => c.value === color)?.fill
}

export function strokeClass(color: BorderColor) {
  return BORDER_COLORS.find(c => c.value === color)?.stroke
}
