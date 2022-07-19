import { computed, toRefs, unref, ref } from 'vue'
import { useEventListener } from '../useEventListener'
import { defaultWindow, isClient } from '../utils'

export function useDraggable(target, options = {}) {
  const draggingElement = options.draggingElement ?? defaultWindow
  const position = ref(options.initialValue ?? { x: 0, y: 0 })
  const pressedDelta = ref()

  const filterEvent = e => {
    if (options.pointerTypes) {
      return options.pointerTypes.includes(e.pointerType)
    }
    return true
  }

  const handleEvent = e => {
    if (unref(options.preventDefault)) e.preventDefault()
    if (unref(options.stopPropagation)) e.stopPropagation()
  }

  const start = e => {
    if (!filterEvent(e)) return
    if (unref(options.exact) && e.target !== unref(target)) return
    const rect = unref(target)?.getBoundingClientRect()
    const pos = {
      x: e.pageX - rect.left,
      y: e.pageY - rect.top
    }
    if (options.onStart?.(pos, e) === false) return
    pressedDelta.value = pos
    handleEvent(e)
  }
  const move = e => {
    if (!filterEvent(e)) return
    if (!pressedDelta.value) return
    position.value = {
      x: e.pageX - pressedDelta.value.x,
      y: e.pageY - pressedDelta.value.y
    }
    options.onMove?.(position.value, e)
    handleEvent(e)
  }
  const end = e => {
    if (!filterEvent(e)) return
    if (!pressedDelta.value) return
    pressedDelta.value = undefined
    options.onEnd?.(position.value, e)
    handleEvent(e)
  }

  if (isClient) {
    useEventListener(target, 'pointerdown', start, true)
    useEventListener(draggingElement, 'pointermove', move, true)
    useEventListener(draggingElement, 'pointerup', end, true)
  }

  return {
    ...toRefs(position),
    position,
    isDragging: computed(() => !!pressedDelta.value),
    style: computed(() => `left:${position.value.x}px;top:${position.value.y}px;`)
  }
}
