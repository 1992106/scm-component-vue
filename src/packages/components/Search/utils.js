import { cloneDeep, omit } from 'lodash-es'
import { recursive } from '@src/utils'

export const mergeEvents = (defaultEventsMap, defaultEvents = [], events = {}) => {
  const newEvents = defaultEvents.reduce((prev, name) => {
    const defaultEvent = defaultEventsMap[name] || Function.prototype
    const event = events[name]
    prev[name] = event
      ? $event => {
          event($event)
          defaultEvent($event)
        }
      : defaultEvent
    return prev
  }, {})
  return { ...events, ...newEvents }
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
