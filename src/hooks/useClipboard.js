import { unref, ref } from 'vue'
import { useTimeoutFn } from './useTimeoutFn'
import { useEventListener } from './useEventListener'

export function useClipboard(options = {}) {
  // 获取配置
  const { navigator = window.navigator, read = false, source, copiedDuring = 1500 } = options
  // 事件类型
  const events = ['copy', 'cut']
  // 判断当前浏览器知否支持clipboard
  const isSupported = Boolean(navigator && 'clipboard' in navigator)
  // 导出的text
  const text = ref('')
  // 导出的copied
  const copied = ref(false)
  // 使用的的定时器钩子
  const timeout = useTimeoutFn(() => (copied.value = false), copiedDuring)

  function updateText() {
    // 解析系统剪贴板的文本内容返回一个Promise
    navigator.clipboard.readText().then(value => {
      text.value = value
    })
  }

  if (isSupported && read) {
    // 绑定事件
    for (const event of events) {
      useEventListener(event, updateText)
    }
  }

  // 复制剪切板方法
  // navigator.clipboard.writeText 方法是异步的返回一个promise
  async function copy(value = unref(source)) {
    if (isSupported && value != null) {
      await navigator.clipboard.writeText(value)
      // 响应式的值，方便外部能动态获取
      text.value = value
      copied.value = true
      timeout.start() // copied.value = false
    }
  }

  return {
    isSupported,
    text,
    copied,
    copy
  }
}
