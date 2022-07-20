import { cloneDeep, isFunction, omit } from 'lodash-es'
import { recursive } from '@src/utils'

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

export const cleanDisabled = column => {
  const props = column?.props || {}
  const options = cloneDeep(props?.options || [])
  const treeData = cloneDeep(props?.treeData || [])
  if (['ASelect', 'AAutoComplete'].includes(column.type)) {
    return { ...column, props: { ...props, options: options.map(val => omit(val, ['disabled'])) } }
  } else if (column.type === 'ACascader') {
    recursive(options, node => {
      delete node.disabled
    })
    return { ...column, props: { ...props, options } }
  } else if (column.type === 'ATreeSelect') {
    recursive(treeData, node => {
      delete node.disabled
      delete node.disableCheckbox
    })
    return { ...column, props: { ...props, treeData } }
  } else {
    return column
  }
}
