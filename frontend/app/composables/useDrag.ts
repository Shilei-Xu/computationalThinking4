type DragHandlers = {
  start?: () => void
  move: (dx: number, dy: number) => void
  end?: (dx: number, dy: number) => void
}

// Follows one pointer (mouse, touch or pen) from press to release and
// reports how far it has moved since the press.
export function useDrag({ start, move, end }: DragHandlers) {
  return (down: PointerEvent) => {
    if (!down.isPrimary || down.button !== 0) return
    const el = down.currentTarget as HTMLElement
    el.setPointerCapture(down.pointerId)
    start?.()

    const delta = (e: PointerEvent) => [e.clientX - down.clientX, e.clientY - down.clientY] as const
    const onMove = (e: PointerEvent) => {
      if (e.pointerId === down.pointerId) move(...delta(e))
    }
    const onUp = (e: PointerEvent) => {
      if (e.pointerId !== down.pointerId) return
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerup', onUp)
      el.removeEventListener('pointercancel', onUp)
      end?.(...delta(e))
    }

    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerup', onUp)
    el.addEventListener('pointercancel', onUp)
  }
}
