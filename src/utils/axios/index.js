import httpService from './axios'

/**
 * request请求
 * @param url
 * @param params
 * @param method
 * @param options
 * @returns {Promise<unknown>}
 */
export function request(url, params = {}, method = 'post', options = {}) {
  const config = {
    url,
    method,
    ...(method === 'post' ? { data: params } : {}),
    ...(method === 'get' ? { params: params } : {}),
    options
  }
  return new Promise((resolve, reject) => {
    httpService(config)
      .then((res = {}) => {
        resolve(res)
      })
      .catch(err => {
        reject(err)
      })
  })
}

/**
 * post请求
 * @param url
 * @param params
 * @param options
 * @returns {Promise<unknown>}
 */
export async function post(url, params = {}, options = {}) {
  try {
    const res = await request(url, params, 'post', options)
    return res?.data
  } catch (err) {
    return err?.data
  }
}

/**
 * get请求
 * @param url
 * @param params
 * @param options
 * @returns {Promise<unknown>}
 */
export async function get(url, params = {}, options = {}) {
  try {
    const res = await request(url, params, 'get', options)
    return res?.data
  } catch (err) {
    return err?.data
  }
}
