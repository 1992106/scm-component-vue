import VXETable from 'vxe-table'
import { formatDate, formatTime, isEmpty } from '@src/utils'

export const formats = {
  formatDate({ cellValue }, format) {
    if (isEmpty(cellValue)) return '--'
    return formatDate(cellValue, format || 'yyyy-MM-dd')
  },
  formatTime({ cellValue }, format) {
    if (isEmpty(cellValue)) return '--'
    return formatTime(cellValue, format || 'yyyy-MM-dd HH:mm')
  },
  formatEmpty({ cellValue }, key) {
    if (isEmpty(cellValue)) return '--'
    if (key === 'boolean') {
      cellValue = !!cellValue
    }
    if (typeof cellValue === 'boolean') {
      return cellValue === true ? '是' : '否'
    }
  }
}

// VXETable格式化
VXETable.formats.mixin(formats)
