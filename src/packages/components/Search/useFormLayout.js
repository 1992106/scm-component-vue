import { getCurrentInstance } from 'vue'
import { triggerResize } from '@src/utils'

export function useFormLayout() {
  const { proxy } = getCurrentInstance()

  const updateLayout = () => {
    const elForm = proxy.$refs['xForm'].$el
    const childNodes = Array.from(elForm.children)
    if (childNodes < 2) return
    const lastNode = childNodes.pop() // 删除最后一个（搜索按钮组）
    const lastLeft = getLastNodeLeft(lastNode) // 搜索按钮组left
    const index = childNodes.findIndex(node => {
      const { right } = node.getBoundingClientRect()
      const prevWidth = node.nextElementSibling?.getBoundingClientRect()?.width || 0
      return prevWidth + right > lastLeft
    })

    if (index !== -1) {
      const rest = childNodes.slice(index + 1)
      rest.forEach(node => {
        node.classList.add('hidden')
      })
    } else {
      childNodes.forEach(node => {
        node.classList.remove('hidden')
      })
    }
    // TODO: 手动触发resize事件，调整表格高度
    setTimeout(() => {
      triggerResize()
    }, 200)
  }

  const getLastNodeLeft = lastNode => {
    const maxRight = proxy.$el.getBoundingClientRect().right
    // 搜索按钮组的宽度
    const width = getLastNodeRealWidth(lastNode)
    return maxRight - width
  }

  const getLastNodeRealWidth = lastNode => {
    const [searchBtn, extraBtn] = Array.from(lastNode.children)
    return searchBtn.offsetWidth + (extraBtn ? getNodeRealWidth(extraBtn) : 0)
  }

  const getNodeRealWidth = lastNode => {
    const childNodes = Array.from(lastNode.children)
    return childNodes.reduce((total, node) => {
      return total + node.offsetWidth
    }, 0)
  }

  const hasExpand = () => {
    const maxHeight = proxy.$el.clientHeight
    const elForm = proxy.$refs['xForm'].$el
    const childNodes = Array.from(elForm.children)
    const firstNode = childNodes[0]
    return firstNode && maxHeight > firstNode.clientHeight
  }

  return {
    updateLayout,
    hasExpand
  }
}
