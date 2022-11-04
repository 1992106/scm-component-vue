import JsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { toBlob } from './utils'

export const jsPDF = ({ el, fileName, direction, mode, callback }) => {
  // 滚动置顶，防止顶部空白
  // window.pageYoffset = 0
  // document.documentElement.scrollTop = 0
  // document.body.scrollTop = 0
  // a4纸的尺寸
  const [a4Width, a4Height] = direction === 'l' ? [841.89, 592.28] : [592.28, 841.89]
  // 复制一个dom元素插入body,解决横向滚动问题
  const dom = el.cloneNode(true)
  dom.style.width = `${a4Width}pt` // 设置PDF宽度
  document.body.appendChild(dom)

  // 一页的高度
  const pageHeight = Math.floor((dom.scrollWidth / a4Width) * a4Height)
  // 获取分割dom，此处为class类名为item的dom
  const domList = dom.getElementsByClassName('page-break')
  // 进行分割操作，当dom内容已超出a4的高度，则将该dom前插入一个空dom，把他挤下去，分割
  let eleBounding = dom.getBoundingClientRect()
  for (let i = 0; i < domList.length; i++) {
    let node = domList[i]
    let bound = node.getBoundingClientRect()
    // 两者相减获得当前元素距离容器顶部距离
    let offsetEle = bound.bottom - eleBounding.top
    let currentPage = Math.ceil(offsetEle / pageHeight) //当前元素应该在哪一页
    let parentNode = node.parentNode // 获取该div的父节点
    let newNode = document.createElement('div')
    newNode.className = 'emptyDiv'
    newNode.style.background = 'white'
    newNode.style.height = pageHeight * currentPage - offsetEle + 'px'
    newNode.style.width = '100%'
    let next = node.nextElementSibling // 获取div的下一个兄弟节点
    // 判断兄弟节点是否存在
    if (next) {
      // 存在则将新节点插入到div的下一个兄弟节点之前
      parentNode.insertBefore(newNode, next)
    } else {
      // 不存在则直接添加到最后，appendChild默认添加到divParent的最后
      parentNode.appendChild(newNode)
    }
  }

  html2canvas(dom, {
    scale: window.devicePixelRatio * 3,
    allowTaint: true,
    backgroundColor: '#fff'
  }).then(canvas => {
    // 一页pdf显示html页面生成的canvas高度
    const pageHeight = Math.floor((canvas.width / a4Width) * a4Height)
    // 未生成pdf的html页面总高度
    let leftHeight = canvas.height
    // 页面偏移
    let position = 0
    // html页面生成的canvas在pdf中图片的宽高
    const imgWidth = a4Width
    const imgHeight = Math.floor((a4Width / canvas.width) * canvas.height)

    const pageData = canvas.toDataURL('image/jpeg', 1.0)

    const pdf = new JsPDF(direction, 'pt', 'a4')

    pdf.setDisplayMode('fullwidth', 'continuous', 'FullScreen')

    // 有两个高度需要区分，一个是html页面的实际高度和生成pdf的页面高度
    // 当内容未超过pdf一页显示的范围，无需分页
    if (leftHeight < pageHeight) {
      pdf.addImage(pageData, 'JPEG', 0, 0, imgWidth, imgHeight)
    } else {
      // 多页打印
      while (leftHeight > 0) {
        pdf.addImage(pageData, 'JPEG', 0, position, imgWidth, imgHeight)
        leftHeight -= pageHeight
        position -= a4Height
        // 避免添加空白页
        if (leftHeight > 0) {
          pdf.addPage()
        }
      }
    }
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
  })
}
