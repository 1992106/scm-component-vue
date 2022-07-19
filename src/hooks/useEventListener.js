import { watch } from 'vue'
import { isString, noop, tryOnScopeDispose, unrefElement } from './utils'

export function useEventListener(...args) {
  let target
  let event
  let listener
  let options
  // 如果第一个参数是否是字符串
  if (isString(args[0])) {
    // 结构内容
    ;[event, listener, options] = args
    target = window
  } else {
    ;[target, event, listener, options] = args
  }
  let cleanup = noop
  const stopWatch = watch(
    () => unrefElement(target), // 监听dom
    el => {
      cleanup() // 执行默认函数
      if (!el) return
      // 绑定事件el如果没有传入就绑定为window
      el.addEventListener(event, listener, options)
      // 重写函数方便改变的时候卸载
      cleanup = () => {
        el.removeEventListener(event, listener, options)
        cleanup = noop
      }
    },
    // flush: 'post' 模板引用侦听
    { immediate: true, flush: 'post' }
  )

  // 卸载
  const stop = () => {
    stopWatch()
    cleanup()
  }

  tryOnScopeDispose(stop)

  return stop
}
