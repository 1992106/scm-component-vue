import { deepTrim } from '@utils'

export const hasOwn = (config, key) => {
  return Object.prototype.hasOwnProperty.call(config, key)
}

// 处理参数
export const disposeParams = config => {
  const key = config.method === 'get' ? 'params' : 'data'
  // 过滤前后空格
  deepTrim(config[key])
}
