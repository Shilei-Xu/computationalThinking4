type PinchHandler = (scale: number, cx: number, cy: number, dx: number, dy: number) => void

// Watches touch pointers and reports two-finger pinches: how much the
// distance between the fingers changed (scale), their centre (cx, cy)
// and how far that centre moved (dx, dy) since the last report.
export function usePinch(onPinch: PinchHandler) {
  const touches = new Map<number, { x: number, y: number }>()
  let last: { distance: number, cx: number, cy: number } | null = null

  function measure() {
    const [a, b] = [...touches.values()] as [{ x: number, y: number }, { x: number, y: number }]
    return { distance: Math.hypot(a.x - b.x, a.y - b.y), cx: (a.x + b.x) / 2, cy: (a.y + b.y) / 2 }
  }

  function down(e: PointerEvent) {
    if (e.pointerType !== 'touch') return
    touches.set(e.pointerId, { x: e.clientX, y: e.clientY })
    last = touches.size === 2 ? measure() : null
  }

  function move(e: PointerEvent) {
    if (!touches.has(e.pointerId)) return
    touches.set(e.pointerId, { x: e.clientX, y: e.clientY })
    if (!last || touches.size !== 2) return
    const now = measure()
    onPinch(now.distance / last.distance, now.cx, now.cy, now.cx - last.cx, now.cy - last.cy)
    last = now
  }

  function up(e: PointerEvent) {
    touches.delete(e.pointerId)
    last = touches.size === 2 ? measure() : null
  }

  return { down, move, up }
}
