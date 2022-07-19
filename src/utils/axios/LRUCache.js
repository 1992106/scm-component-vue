import { getHashByConfig } from '@utils/axios/utils'

class LRUCache {
  constructor(capacity) {
    if (typeof capacity !== 'number' || capacity < 0) {
      throw new TypeError('capacity必须是一个非负数')
    }
    this.capacity = capacity
    this.cache = new Map()
  }

  // 获取缓存
  get(config) {
    const key = getHashByConfig(config)
    if (this.cache.has(key)) {
      const tmp = this.cache.get(key)
      // 将当前的缓存移动到最常用的位置
      this.cache.delete(key)
      this.cache.set(key, tmp)
      return tmp
    }
  }

  // 设置缓存
  set(config, value) {
    const key = getHashByConfig(config)
    if (this.cache.has(key)) {
      // 如果缓存存在更新缓存位置
      this.cache.delete(key)
    } else if (this.cache.size >= this.capacity) {
      // 如果缓存容量已满，删除最近最少使用的缓存
      this.cache.delete(this.cache.keys().next.val)
    }
    this.cache.set(key, value)
  }
}

export default LRUCache
export const cache = new LRUCache(100)
