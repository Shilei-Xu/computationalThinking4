type DragHandlers = {
  start?: () => void
  move: (dx: number, dy: number) => void
  // `tap` is true when the pointer was released without really moving (a click or tap).
  end?: (dx: number, dy: number, tap: boolean) => void
}

// Pointer movement below this many pixels counts as a tap, not a drag.
const TAP_DISTANCE = 4

// Follows one pointer (mouse, touch or pen) from press to release and
// reports how far it has moved since the press, in screen pixels.
// A second finger touching down (the start of a pinch) ends the drag early.
export function useDrag({ start, move, end }: DragHandlers) {
  return (down: PointerEvent) => {
    if (!down.isPrimary || down.button !== 0) return
    const el = down.currentTarget as HTMLElement
    el.setPointerCapture(down.pointerId)
    start?.()

    let moved = [0, 0] as [number, number]
    const onMove = (e: PointerEvent) => {
      if (e.pointerId !== down.pointerId) return
      moved = [e.clientX - down.clientX, e.clientY - down.clientY]
      move(...moved)
    }
    const stop = (tap: boolean) => {
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerup', onUp)
      el.removeEventListener('pointercancel', onUp)
      window.removeEventListener('pointerdown', onOtherDown, true)
      end?.(...moved, tap)
    }
    const onUp = (e: PointerEvent) => {
      if (e.pointerId !== down.pointerId) return
      moved = [e.clientX - down.clientX, e.clientY - down.clientY]
      stop(e.type === 'pointerup' && Math.hypot(...moved) < TAP_DISTANCE)
    }
    const onOtherDown = (e: PointerEvent) => {
      if (e.pointerId !== down.pointerId) stop(false)
    }

    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerup', onUp)
    el.addEventListener('pointercancel', onUp)
    window.addEventListener('pointerdown', onOtherDown, true)
  }
}
