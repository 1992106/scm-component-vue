import axios from 'axios'
import { message, notification } from 'ant-design-vue'
import router from '@src/router'
import store from '@src/store'
import { omit } from 'lodash-es'
import setting from '@src/config'
import { getAccessStorage } from '@utils/accessStorage'
import { disposeParams } from './utils'

let locked = false

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
    // 过滤文件流格式
    if (!response.headers['content-type'].includes('application/json')) {
      return response
    }
    const { data, config } = response
    const code = data?.code || data?.status
    if (code === 200) {
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
    if (response) {
      const { data, status, config } = response
      const msg = data?.msg || (typeof data === 'string' ? data : '未知错误')
      // 401：token过期、403：权限变更
      if ([401, 403].includes(status)) {
        store.dispatch('user/logout').then(() => {
          const route = router.currentRoute
          if (route.value.name !== 'Login') {
            router.push(`/login?redirect=${route.value.fullPath}`)
          }
        })
        if (!locked) {
          locked = true
          message.warning('登录失效，请重新登录！')
          setTimeout(() => {
            locked = false
          }, 3000)
        }
      } else {
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
