import axios from 'axios'
import { message, notification } from 'ant-design-vue'
import router from '@src/router'
import setting from '@src/config'
import { omit } from 'lodash-es'
import { getAccessStorage } from '@utils/accessStorage'
import { disposeParams, sleep } from './utils'
import { cache } from './LRUCache'
import { queue } from './requestQueue'

// 全局axios默认值
axios.defaults.baseURL = setting.api_url
axios.defaults.timeout = setting.request_timeout

// 创建axios实例
const httpService = axios.create({
  withCredentials: true,
  xsrfHeaderName: 'Authorization',
  xsrfCookieName: 'Authorization'
})

// 添加请求拦截器
httpService.interceptors.request.use(
  config => {
    // 是否支持取消
    const hasCancel = config?.options['$cancel']
    if (hasCancel) {
      // 在请求开始前，对之前的请求做检查取消操作
      queue.removeQueue(config)
      // 将当前请求添加到中
      queue.addQueue(config)
    }
    const apiUrl = getAccessStorage(setting.api_name)
    const token = getAccessStorage(setting.token_name)
    if (apiUrl) config.baseURL = apiUrl
    if (token) config.headers[setting.authorization_name] = `${setting.token_prefix} ${token}`
    // 排除自定义关配置，合并其它配置
    const options = omit(config?.options, ['$msg', '$errorMsg', '$cache', '$retry', '$retryDelay'])
    Object.assign(config, options)
    // 处理请求参数
    disposeParams(config)
    // console.log(config, 'request config')
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 添加响应拦截器
httpService.interceptors.response.use(
  response => {
    // 在请求结束后，移除本次请求
    queue.removeQueue(response.config)
    // 过滤文件流格式
    if (!response.headers['content-type'].includes('application/json')) {
      return response
    }
    const { data, config } = response
    const code = data?.code || data?.status
    if (code === 200) {
      // 是否支持缓存
      const hasCache = config?.options['$cache']
      // 设置缓存
      if (hasCache) {
        cache.set(config, response)
      }
      // 是否有自定义$msg
      const hasMsg = config?.options['$msg'] !== 'none'
      const msg = config?.options['$msg'] || data?.message || data?.msg
      // 业务操作提示：增删改
      if (hasMsg && msg) {
        message.success(msg)
      }
      return response
    } else {
      // 除200外，其它状态（[500, -1]）业务错误提示
      const hasErrorMsg = config?.options['$errorMsg'] !== 'none'
      const msg = config?.options['$errorMsg'] || data?.message || data?.msg
      if (hasErrorMsg && msg) {
        notification.error({ message: '系统提示', description: msg })
      }
      return Promise.reject(response)
    }
  },
  error => {
    const { response } = error
    // 在请求结束后，移除本次请求
    queue.removeQueue(response?.config)
    if (response) {
      const { data, status, config } = response
      const msg = data?.msg || (typeof data === 'string' ? data : '未知错误')
      // 401：token过期、403：权限变更
      if ([401, 403].includes(status)) {
        const route = router.currentRoute
        if (!route.value.fullPath.includes('/login')) {
          router.push(`/login??redirect=${route.value.path}`)
        }
        message.warning('登录失效，请重新登录！')
      } else {
        // 是否支持重试
        const hasRetry = config?.options['$retry'] || config['$retryDelay']
        if (hasRetry) {
          const { $retry: retry = 3, $retryDelay: retryDelay = 1000 } = config?.options || {}
          config.__retryCount = config.__retryCount || 0
          if (config.__retryCount >= retry) {
            return Promise.reject()
          }
          config.__retryCount += 1
          return sleep(retryDelay).then(() => {
            return httpService(config)
          })
        }
        notification.error({ message: `${status}错误：${config.url}`, description: msg })
      }
    } else {
      notification.error({ message: '系统错误', description: '连接到服务器失败！' })
    }
    const errorMessage = error?.response || { data: { status: -1000, msg: '未知错误！' } }
    return Promise.reject(errorMessage)
  }
)

export default httpService
