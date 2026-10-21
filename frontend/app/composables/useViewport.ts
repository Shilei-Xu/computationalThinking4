import { reactive } from 'vue'

const MIN_ZOOM = 0.25
const MAX_ZOOM = 2
// Caps a single wheel event, so one mouse-wheel notch zooms by about 25%
// while small trackpad pinch events still zoom smoothly.
const MAX_WHEEL_DELTA = 25

// Which part of the board is visible: a point on the board at (bx, by)
// is drawn on screen at (x + bx * zoom, y + by * zoom).
export function useViewport() {
  const view = reactive({ x: 0, y: 0, zoom: 1 })

  // Changes the zoom while keeping the screen point (sx, sy) in place,
  // so zooming goes toward the cursor or pinch centre.
  function zoomAt(zoom: number, sx: number, sy: number) {
    const next = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom))
    view.x = sx - (sx - view.x) * next / view.zoom
    view.y = sy - (sy - view.y) * next / view.zoom
    view.zoom = next
  }

  function toBoard(sx: number, sy: number) {
    return { x: (sx - view.x) / view.zoom, y: (sy - view.y) / view.zoom }
  }

  // Ctrl/Cmd + wheel and trackpad pinch (which browsers report as ctrl + wheel) zoom;
  // plain wheel and two-finger trackpad scrolling pan.
  function onWheel(e: WheelEvent) {
    if (e.ctrlKey || e.metaKey) {
      const delta = Math.min(MAX_WHEEL_DELTA, Math.max(-MAX_WHEEL_DELTA, e.deltaY))
      zoomAt(view.zoom * Math.exp(-delta / 100), e.clientX, e.clientY)
    }
    else {
      view.x -= e.deltaX
      view.y -= e.deltaY
    }
  }

  return { view, zoomAt, toBoard, onWheel }
}
