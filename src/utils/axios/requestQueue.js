import { getHashByConfig } from '@utils/axios/utils'
import axios from 'axios'

class RequestQueue {
  constructor() {
    this.queue = new Map()
  }

  // 添加请求
  addQueue(config) {
    const uniqueKey = getHashByConfig(config)
    config.cancelToken =
      config.cancelToken ||
      new axios.CancelToken(cancel => {
        if (!this.queue.has(uniqueKey)) {
          // 如果queue中不存在当前请求，则添加当前请求
          this.queue.set(uniqueKey, cancel)
        }
      })
  }

  // 移除请求
  removeQueue(config) {
    const uniqueKey = getHashByConfig(config)
    if (this.queue.has(uniqueKey)) {
      // 如果queue中存在当前请求，则取消当前请求并移除
      const cancel = this.queue.get(uniqueKey)
      cancel(uniqueKey)
      this.queue.delete(uniqueKey)
    }
  }

  // 清空请求
  clearQueue() {
    for (const [url, cancel] of this.queue) {
      cancel(url)
    }
    this.queue.clear()
  }
}

export const queue = new RequestQueue()
export default RequestQueue
