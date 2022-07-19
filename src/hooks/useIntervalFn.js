import { unref, ref, watch, isRef } from 'vue'
import { isClient, tryOnScopeDispose } from './utils'

export function useIntervalFn(cb, interval = 1000, options = {}) {
  const { immediate = true, immediateCallback = false } = options

  let timer = null
  const isActive = ref(false)

  function clean() {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
  }

  function pause() {
    isActive.value = false
    clean()
  }

  function resume() {
    if (unref(interval) <= 0) return
    isActive.value = true
    if (immediateCallback) cb()
    clean()
    timer = setInterval(cb, unref(interval))
  }

  if (immediate && isClient) resume()

  if (isRef(interval)) {
    const stopWatch = watch(interval, () => {
      if (immediate && isClient) resume()
    })
    tryOnScopeDispose(stopWatch)
  }

  tryOnScopeDispose(pause)

  return {
    isActive,
    pause,
    resume
  }
}
