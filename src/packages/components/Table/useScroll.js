import { onBeforeUnmount, onMounted, unref } from 'vue'
import { debounce } from 'lodash-es'
// import { getScrollBarSize } from '@src/utils'

export const useScroll = ({ xTable, autoResize, extraHeight, scroll }) => {
  const onResize = debounce(() => {
    scroll.value = getTableScroll({ extraHeight })
  }, 200)

  const initResize = () => {
    if (unref(xTable) && window.MutationObserver) {
      const observer = new MutationObserver(onResize)
      observer.observe(unref(xTable)?.$el, { attributes: true, childList: true, subtree: true })
      setTimeout(() => {
        observer && observer.disconnect()
      }, 3000)
    }
  }

  onMounted(() => {
    if (autoResize) {
      // 由于Table是动态异步生成，初始化直接调用onResize()无效，所以使用MutationObserver来实现
      initResize()
      // onResize()
      window.addEventListener('resize', onResize)
    }
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', onResize)
  })
}

export const getTableScroll = ({ id, extraHeight } = {}) => {
  let tHeader
  let summary
  let pagination
  if (id) {
    tHeader = document.getElementById(id)
      ? document.getElementById(id).querySelector('.x-table .ant-table .ant-table-header')
      : null
    summary = document.getElementById(id)
      ? document.getElementById(id).querySelector('.x-table .ant-table .ant-table-summary')
      : null
    pagination = document.getElementById(id)
      ? document.getElementById(id).querySelector('.x-table .ant-table-pagination')
      : null
  } else {
    tHeader = document.querySelector('.x-table .ant-table .ant-table-header')
    summary = document.querySelector('.x-table .ant-table .ant-table-summary')
    pagination = document.querySelector('.x-table .ant-table-pagination')
  }
  // 表格内容距离顶部的距离
  let tHeaderBottom = 0
  if (tHeader) {
    tHeaderBottom = tHeader.getBoundingClientRect().bottom
  }
  // 总结栏
  let summaryHeight = 0
  if (summary) {
    summaryHeight = summary.getBoundingClientRect().height
  }
  // 分页器的高度
  let paginationHeight = 0
  if (pagination) {
    paginationHeight = pagination.getBoundingClientRect().height
  }
  // 其它高度：页面内边距或外边距
  if (typeof extraHeight === 'undefined') {
    extraHeight = 0
  }
  // 表格窗体高度-表格内容顶部的高度-表格内容底部的高度
  const height = `calc(100vh - ${tHeaderBottom + summaryHeight + paginationHeight + extraHeight}px)`

  // TODO: 设置表格高度不生效
  // const bodyEl = document.querySelector('.x-table .ant-table .ant-table-body')
  // if (bodyEl) {
  //   bodyEl.style.cssText += `height: ${y}px`
  // }
  // 空数据时，设置高度
  // const emptyEl = document.querySelector('.x-table .ant-table-empty  .ant-table-body .ant-table-placeholder')
  // if (emptyEl) {
  //   const scrollBarWidth = getScrollBarSize()
  //   emptyEl.style.height = `calc(100vh - ${tHeaderBottom + paginationHeight + extraHeight + scrollBarWidth}px)`
  // }

  // TODO: x: 'max-content' 会导致 ellipsis: true 无效
  return { x: '100%', y: height }
}
