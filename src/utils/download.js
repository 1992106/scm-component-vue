import myFetch from '@utils/fetch'
import { getPixelSize, isEmpty } from '@utils/lang'

const { request } = myFetch

/**
 * 下载图片/文件
 * @param url
 * @param fileName
 */
const download = (url, fileName) => {
  const aLink = document.createElement('a')
  aLink.style.display = 'none'
  aLink.href = url
  aLink.download = fileName || ''
  document.body.appendChild(aLink)
  // const event = document.createEvent('MouseEvents') // 创建鼠标事件对象
  // event.initEvent('click', false, false) //初始化事件对象
  // aLink.dispatchEvent(event) // 给指定的元素，执行事件click事件
  aLink.click()
  document.body.removeChild(aLink)
}

/**
 * 下载图片/文件-文件流
 * @param content
 * @param fileName
 * @param type
 */
const downloadByBlob = (content, fileName, type) => {
  const blob = new Blob([content], { type: type })
  // 生成ObjectURL
  const src = URL.createObjectURL(blob)
  // 下载
  download(src, fileName)
  // 释放URL对象
  URL.revokeObjectURL(src)
}

/**
 * 下载图片/文件-资源url
 * @param url
 * @param fileName
 * @returns {Promise<void>}
 */
const downloadByUrl = async (url, fileName) => {
  const res = await fetch(url, {
    method: 'GET',
    responseType: 'blob',
    mode: 'cors',
    cache: 'no-cache'
  }).then(res => {
    return res.blob()
  })
  downloadByBlob(res, fileName, res.type)
}

/**
 * 导出文件
 * @param url
 * @param params
 * @param method
 * @returns {Promise<void>}
 */
const exportFile = async (url, params = {}, method = 'get') => {
  const res = await request(url, params, method, { responseType: 'blob' })
  const headers = decodeURI(res.headers['Content-Disposition'] || res.headers['content-disposition'])
  const fileName = headers.split("attachment;filename*=utf-8''").slice(-1).pop()

  downloadByBlob(res.data, fileName, 'application/octet-stream')
}

/**
 * 压缩图片
 * @param src
 * @param width
 * @param height
 * @param quality
 * @returns {Promise<unknown>}
 */
const compressImage = async (src, width, height, quality = 1) => {
  return new Promise((resolve, reject) => {
    const image = new Image()
    width = getPixelSize(width)
    height = getPixelSize(height)
    image.setAttribute('crossOrigin', 'Anonymous')
    image.onload = async () => {
      // 有宽度无高度时，等比例计算高度
      if (!isEmpty(width) && isEmpty(height)) {
        height = (width / image.width) * image.height
      }
      // 有高度无宽度时：等比例计算宽度
      if (!isEmpty(height) && isEmpty(width)) {
        width = (height / image.height) * image.width
      }
      if (isEmpty(width) && isEmpty(height)) {
        width = image.width
        height = image.height
      }
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      canvas.getContext('2d').drawImage(image, 0, 0, width, height)
      const canvasURL = canvas.toDataURL('image/jpeg', quality)
      resolve(canvasURL)
    }
    image.onerror = () => {
      reject()
    }
    image.src = src
  })
}

export { download, downloadByBlob, downloadByUrl, exportFile, compressImage }
