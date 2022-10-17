const defaultOptions = {
  el: null, // 打印目标dom节点
  debug: false, // 打开调试模式，会显示iframe
  importCss: true, // 引入head 中的link stylesheet
  importStyle: true, // 引入style标签中的样式
  loadCss: [] // 需要载入的第三方样式表
}
let iframe = null
let dom = null
/**
 * 检查配置是否合法
 * @param {*} options
 */
const checkOptions = options => {
  if (!options.el) {
    throw new Error('el must be a nodeType')
  }
  return {
    ...defaultOptions,
    ...options
  }
}
const prinf = options => {
  const op = checkOptions(options)
  dom = op.el.cloneNode(true)
  const handle = createIframe(op)

  setTimeout(() => {
    handle.focus()
    handle.print()
    if (op.debug === false) {
      removeIframe()
    }
    // 完成回调
    if (op.callback) {
      op.callback()
    }
  }, 200)
}

const createIframe = op => {
  const { debug, importCss, importStyle, loadCss, title } = op
  removeIframe()
  iframe = document.createElement('iframe')
  if (debug === false) {
    iframe.style.display = 'none'
  }
  // 插入需要打印的目标元素
  document.querySelector('body').appendChild(iframe)
  iframe.contentDocument.title = title
  const { body, head } = iframe.contentDocument
  const contentWindow = iframe.contentWindow
  // 插入head中的link stylesheet
  if (importCss) {
    const stylesheets = document.querySelectorAll("link[rel = 'stylesheet']")
    stylesheets.forEach(item => {
      head.appendChild(item.cloneNode(true))
    })
  }
  // 插入style
  if (importStyle) {
    const stylesheets = document.querySelectorAll('style')
    stylesheets.forEach(item => {
      body.appendChild(item.cloneNode(true))
    })
  }
  // 插入外部样式文件
  if (Array.isArray(loadCss) && loadCss.length > 0) {
    loadCss.forEach(item => {
      head.appendChild(item)
    })
  }
  body.appendChild(dom)
  return contentWindow
}

const removeIframe = () => {
  if (iframe) {
    document.querySelector('body').removeChild(iframe)
    iframe = null
    dom = null
  }
}

export default prinf
