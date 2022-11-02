import JsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { toBlob } from './utils'

export const jsPDF = ({ el, fileName, direction, mode, callback }) => {
  // 获取a4纸的宽高
  const [a4w, a4h] = direction === 'l' ? [841.89, 592.28] : [592.28, 841.89]
  const dom = el.cloneNode(true)
  dom.style.width = `${a4w}pt` // 设置PDF宽度
  document.body.appendChild(dom)

  // 滚动置顶，防止顶部空白
  const scrollTop = document.documentElement.scrollTop || document.body.scrollTop // 获取滚动轴滚动的长度
  let opts = {
    dpi: 350,
    scale: window.devicePixelRatio * 3,
    useCORS: true,
    background: '#FFF',
    allowTaint: false,
    scrollY: -scrollTop,
    scrollX: 0
  }

  html2canvas(dom, opts).then(canvas => {
    const pdf = new JsPDF(direction, 'pt', 'a4')
    const ctx = canvas.getContext('2d')
    const imgHeight = Math.floor((canvas.width / a4w) * a4h) // 按A4显示比例换算一页图像的像素高度
    let renderedHeight = 0

    while (renderedHeight < canvas.height) {
      const page = document.createElement('canvas')
      page.width = canvas.width
      page.height = Math.min(imgHeight, canvas.height - renderedHeight) // 可能内容不足一页

      // 用getImageData剪裁指定区域，并画到前面创建的canvas对象中
      page
        .getContext('2d')
        .putImageData(
          ctx.getImageData(0, renderedHeight, canvas.width, Math.min(imgHeight, canvas.height - renderedHeight)),
          0,
          0
        )
      pdf.addImage(
        page.toDataURL('image/jpeg', 1.0),
        'JPEG',
        0,
        0,
        a4w,
        Math.min(a4h, (a4w * page.height) / page.width)
      ) // 添加图像到页面

      renderedHeight += imgHeight
      if (renderedHeight < canvas.height) {
        pdf.addPage() // 如果后面还有内容，添加一个空页
      }
    }

    // 下载
    if (mode === 'download') {
      pdf.save(fileName || Date.now().toString())
    }
    // 打印
    if (mode === 'print') {
      const link = window.URL.createObjectURL(toBlob(pdf.output('datauristring')))
      const myWindow = window.open(link)
      myWindow.print()
    }
    // 移除节点
    dom.parentNode.removeChild(dom)
    // 完成回调
    callback && callback(pdf)
  })
}
