// Distance between grid points in pixels.
export const GRID = 24

export function snap(value: number) {
  return Math.round(value / GRID) * GRID
}
