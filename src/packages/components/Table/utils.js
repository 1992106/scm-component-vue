import { isFunction, omit } from 'lodash-es'
import { isEmpty, recursive } from '@src/utils'

// 获取行的value通过rowKey
export const getValueByRowKey = (rowKey, record, index) => {
  if (!rowKey) {
    console.warn('rowKey 不能为空')
    return index
  }
  if (isFunction(rowKey)) {
    return rowKey(record)
  }
  return record[rowKey]
}

// 获取排序方式 ['ascend', 'descend'] => ['ASC', 'DESC']
export const getSortDirection = order => {
  return ['asc', 'desc'].map(v => order.includes(v) && order.slice(0, v.length).toUpperCase()).filter(Boolean)[0]
}

export const generateLeaf = (columns, list = []) => {
  columns.forEach(column => {
    if (column?.children) {
      generateLeaf(column?.children, list)
    } else {
      list.push(column)
    }
  })
  return list
}

export const getField = column => {
  return column?.dataIndex || column?.key || column?.title
}

const getPrevious = (column, columns) => {
  const index = columns.findIndex(val => getField(val) === getField(column))
  return columns[index - 1]
}

const hasPrevious = (column, columns) => {
  return columns.map(val => getField(val)).includes(getField(column))
}

export const mergeStorageAndColumns = (oldColumns, newColumns) => {
  const listFieldMap = oldColumns.map(val => val?.dataIndex)
  const columnsFieldMap = newColumns.map(val => getField(val))
  // 删除没有的
  const restColumns = oldColumns.filter(item => columnsFieldMap.includes(item?.dataIndex))
  // 找到新增的
  const otherColumns = newColumns.filter(item => !listFieldMap.includes(getField(item)))
  otherColumns.forEach(item => {
    const newPrevious = getPrevious(item, newColumns)
    const isPrevious = hasPrevious(newPrevious, restColumns)
    let newIndex
    if (isPrevious) {
      newIndex = restColumns.findIndex(val => val?.dataIndex === getField(newPrevious)) + 1
    } else {
      newIndex = restColumns.findIndex(val => !val?.fixed)
    }
    const columns = columnsToStorage([item])
    restColumns.splice(newIndex, 0, columns[0])
  })
  return restColumns
}

export const columnsToStorage = columns => {
  return (columns || []).map(val => {
    return {
      title: val?.title,
      dataIndex: getField(val),
      ...(val?.fixed ? { fixed: val?.fixed } : {}),
      ...(val?.width ? { width: val?.width } : {}),
      ...(val?.minWidth ? { minWidth: val?.minWidth } : {}),
      ...(val?.maxWidth ? { maxWidth: val?.maxWidth } : {}),
      visible: isEmpty(val?.visible) ? true : val?.visible
    }
  })
}

export const storageToColumns = (storageColumns, columns) => {
  return (storageColumns || []).map(val => {
    const column = (columns || []).find(v => val?.dataIndex === getField(v))
    const omitList = ['fixed', 'width', 'minWidth', 'maxWidth']
    const restColumn = omit(column || {}, omitList)
    // 递归遍历子设置元素visible
    if (!isEmpty(column.children)) {
      recursive(column.children, column => {
        column.visible = val?.visible
      })
    }
    return {
      ...(restColumn ? restColumn : {}),
      ...(val?.fixed ? { fixed: val?.fixed } : {}),
      ...(val?.width ? { width: val?.width } : {}),
      ...(val?.minWidth ? { minWidth: val?.minWidth } : {}),
      ...(val?.maxWidth ? { maxWidth: val?.maxWidth } : {}),
      visible: val?.visible
    }
  })
}
