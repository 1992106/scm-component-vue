import JsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { toBlob } from './utils'

const jsPDF = ({ el, fileName, mode, callback }) => {
  el.style.paddingLeft = '20px'
  el.style.paddingRight = '20px'
  html2canvas(el, {
    dpi: 300,
    scale: 4,
    useCORS: true,
    allowTaint: false,
    height: el.offsetHeight,
    width: el.offsetWidth,
    backgroundColor: '#fff',
    windowWidth: document.body.scrollWidth,
    windowHeight: document.body.scrollHeight
  }).then(canvas => {
    // a4纸的尺寸[841.89,595.28]
    const a4Width = 841.89
    const a4Height = 592.28

    // 一页pdf显示html页面生成的canvas高度;
    const pageHeight = Math.floor((canvas.width / a4Width) * a4Height)
    // 未生成pdf的html页面总高度
    let totalHeight = canvas.height
    // 页面偏移
    let position = 0
    // html页面生成的canvas在pdf中图片的宽高
    const imgHeight = Math.floor((a4Width / canvas.width) * canvas.height)

    const pageData = canvas.toDataURL('image/jpeg', 1.0)

    const pdf = new JsPDF('l', 'pt', 'a4')

    pdf.setDisplayMode('fullwidth', 'continuous', 'FullScreen')

    // 有两个高度需要区分，一个是html页面的实际高度，和生成pdf的页面高度(841.89)
    // 当内容未超过pdf一页显示的范围，无需分页
    if (totalHeight < pageHeight) {
      pdf.addImage(pageData, 'JPEG', 0, 0, a4Width, imgHeight)
    } else {
      // 多页打印
      while (totalHeight > 0) {
        pdf.addImage(pageData, 'JPEG', 0, position, a4Width, imgHeight)
        totalHeight -= pageHeight
        position -= a4Height
        // 避免添加空白页
        if (totalHeight > 0) {
          pdf.addPage()
        }
      }
    }
    // 下载
    if (mode === 'download') {
      pdf.save(fileName)
    }
    // 打印
    if (mode === 'print') {
      const link = window.URL.createObjectURL(toBlob(pdf.output('datauristring')))
      const myWindow = window.open(link)
      myWindow.print()
    }
    // 完成回调
    callback && callback(pdf)
  })
}

export default jsPDF
