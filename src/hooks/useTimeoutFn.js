import { unref, ref } from 'vue'
import { tryOnScopeDispose } from './utils'

export function useTimeoutFn(
  cb, // 回调
  interval, // 时间
  options = {}
) {
  const { immediate = true } = options

  const isPending = ref(false)

  let timer

  function clear() {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
  }

  function stop() {
    isPending.value = false
    clear()
  }

  function start(...args) {
    // 清除上一次定时器
    clear()
    // 是否在pending 状态
    isPending.value = true
    // 重新启动定时器
    timer = setTimeout(() => {
      // 当定时器执行的时候结束pending状态
      isPending.value = false
      // 初始化定时器的id
      timer = null
      // 执行回调
      cb(...args)
    }, unref(interval))
  }
  if (immediate) {
    isPending.value = true

    start()
  }

  tryOnScopeDispose(stop)

  return {
    isPending,
    start,
    stop
  }
}
