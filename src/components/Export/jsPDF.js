import JsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { toBlob } from './utils'

export const jsPDF = ({ el, fileName, direction, mode, callback }) => {
  // 获取a4纸的宽高
  const [a4Width, a4Height] = direction === 'l' ? [841.89, 592.28] : [592.28, 841.89]
  const dom = el.cloneNode(true)
  dom.style.width = `${a4Width}pt` // 设置PDF宽度
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
    // 一页pdf显示html页面生成的canvas高度;
    const pageHeight = Math.floor((canvas.width / a4Width) * a4Height)
    // 未生成pdf的html页面高度
    let leftHeight = canvas.height
    // pdf页面偏移
    let position = 0

    const pdf = new JsPDF(direction, 'pt', 'a4')
    pdf.setDisplayMode('fullwidth', 'continuous', 'FullScreen')

    const cs = document.createElement('canvas')
    let height

    function createImpl(canvas) {
      if (leftHeight > 0) {
        let checkCount = 0
        if (leftHeight > pageHeight) {
          let i
          for (i = position + pageHeight; i >= position; i--) {
            let isWrite = true
            for (let j = 0; j < canvas.width; j++) {
              const c = canvas.getContext('2d').getImageData(j, i, 1, 1).data

              if (c[0] !== 0xff || c[1] !== 0xff || c[2] !== 0xff) {
                isWrite = false
                break
              }
            }
            if (isWrite) {
              checkCount++
              if (checkCount >= 10) {
                break
              }
            } else {
              checkCount = 0
            }
          }
          height = Math.round(i - position) || Math.min(leftHeight, pageHeight)
          if (height <= 0) {
            height = pageHeight
          }
        } else {
          height = leftHeight
        }

        cs.width = canvas.width
        cs.height = height

        const ctx = cs.getContext('2d')
        ctx.drawImage(canvas, 0, position, canvas.width, height, 0, 0, canvas.width, height)

        if (position !== 0) {
          pdf.addPage()
        }
        const pd = cs.toDataURL('image/jpeg', 1.0)
        pdf.addImage(pd, 'JPEG', 0, 0, a4Width, (a4Width / cs.width) * height)
        leftHeight -= height
        position += height
        if (leftHeight > 0) {
          setTimeout(createImpl, 500, canvas)
        } else {
          outputPdf()
        }
      }
    }

    function outputPdf() {
      // 下载
      if (mode === 'download') {
        pdf.save(fileName || Date.now().toString())
      }
      // 打印
      if (mode === 'print') {
        const link = window.URL.createObjectURL(toBlob(pdf.output('datauristring')))
        window.open(link)
      }
      // 移除节点
      dom.parentNode.removeChild(dom)
      // 完成回调
      callback && callback(pdf)
    }

    // 当内容未超过pdf一页显示的范围，无需分页
    if (leftHeight < pageHeight) {
      const pageData = canvas.toDataURL('image/jpeg', 1.0)
      pdf.addImage(pageData, 'JPEG', 0, 0, a4Width, (a4Width / canvas.width) * leftHeight)
      outputPdf()
    } else {
      try {
        pdf.deletePage(0)
        setTimeout(createImpl, 500, canvas)
      } catch (err) {
        console.error(err)
      }
    }
  })
}
