export function toBlob(base64Data) {
  let byteString
  if (base64Data.split(',')[0].indexOf('base64') >= 0) {
    byteString = atob(base64Data.split(',')[1]) // base64 解码
  } else {
    byteString = window.unescape(base64Data.split(',')[1])
  }
  // 获取文件类型
  const mimeString = base64Data.split(';')[0].split(':')[1] // mime类型

  // ArrayBuffer 对象用来表示通用的、固定长度的原始二进制数据缓冲区
  // let arrayBuffer = new ArrayBuffer(byteString.length) // 创建缓冲数组
  // let uintArr = new Uint8Array(arrayBuffer) // 创建视图

  const uintArr = new Uint8Array(byteString.length) // 创建视图

  for (let i = 0; i < byteString.length; i += 1) {
    uintArr[i] = byteString.charCodeAt(i)
  }

  // 使用 Blob 创建一个指向类型化数组的URL, URL.createObjectURL是new Blob文件的方法,可以生成一个普通的url,可以直接使用,比如用在img.src上
  return new Blob([uintArr], {
    type: mimeString
  })
}
