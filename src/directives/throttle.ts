import { throttle, isFunction } from 'lodash-es'
import type { App } from 'vue'

/**
 * @description 节流指令v-throttle
 * @example
 *    1.<button v-throttle="function" />
 *    2.<button v-throttle:[argument]="function" />
 *    3.<button v-throttle="() => function(argument)" />
 *    4.<button v-throttle="function" :wait="400" />
 * @param app
 */
const setupThrottleDirective = (app: App) => {
  app.directive('throttle', (el, { value: fn, arg }, vnode): void => {
    const { wait = 300 } = vnode.props || {}
    if (!isFunction(fn)) {
      return console.error(el, 'v-throttle: 参数缺失, function不存在')
    }
    const handler = () => (arg ? fn(arg) : fn())
    if (wait) {
      el.onclick = throttle(handler, wait)
    } else {
      el.onclick = handler
    }
  })
}

export default setupThrottleDirective
