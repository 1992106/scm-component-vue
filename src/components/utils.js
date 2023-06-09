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

const getType = file => file?.type || file?.mimeType || file?.mimetype

const getName = file => file?.name || file?.fileName || file?.filename

const hasImageByType = type => {
  // 排除特殊图片格式：rgb/pcx/psd/dwg/mdi/pgm/cmx
  return (
    type?.includes('image/') &&
    ![
      'image/x-pcx',
      'image/x-rgb',
      'image/vnd.adobe.photoshop',
      'image/vnd.dwg',
      'image/vnd.ms-modi',
      'image/x-portable-graymap',
      'image/x-cmx'
    ].includes(type)
  )
}

const hasImageByName = name => {
  if (name) {
    const suffix = /\.([0-9a-zA-Z]+)$/i.exec(name)?.[1]?.toLowerCase()
    return ['png', 'jpg', 'jpeg', 'ico', 'gif', 'bmp', 'webp'].includes(suffix)
  }
}

const hasImageByUrl = url => {
  if (url) {
    return /^.+(\.png|\.jpg|\.jpeg|\.ico|\.gif|\.bmp|\.webp)$/i.test(url)
  }
}

export const hasImage = file => {
  const type = getType(file)
  const name = getName(file)
  return hasImageByType(type) || hasImageByName(name) || hasImageByUrl(file?.url)
}
