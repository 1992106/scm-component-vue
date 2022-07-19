import VXETable from 'vxe-table'
import Image from '@packages/components/Image'
import { get } from 'lodash-es'
import { formatDate, formatTime } from '@src/utils'

export const cellRenderer = {
  // 链接
  MyLink: {
    renderDefault(renderOpts, params) {
      let { row, column } = params
      let { events } = renderOpts
      return [
        <a className='my-link' onClick={() => events?.click(params)}>
          {get(row, column.field)}
        </a>
      ]
    }
  },
  /**
   * 缩略图
   * @example
   *  const data = { thumbnail: 'a.jpg', preview: 'b.jpg', images: [{name: 'c', src: 'c.jpg'}, {name: 'd', url: 'd.jpg' }]}
   *  const columns = [
   *    { title: '缩略图', field: 'thumbnail', width: 70, cellRender: { name: 'MyPic', props: { previewField: 'preview'， width: 30 } }} // width (可不传，默认46)
   *  ]
   */
  MyThumb: {
    renderDefault(renderOpts, params) {
      const props = {}
      let urls = []
      const { row, column } = params
      const thumbnail = get(row, column.field) || ''
      if (renderOpts.props?.previewField) {
        urls = get(row, renderOpts.props.previewField) || []
      }

      if (typeof renderOpts.props?.preview === 'boolean') {
        props.preview = renderOpts.props.preview
      }

      props.width = renderOpts.props?.width || 46
      props.height = renderOpts.props?.height || 46

      if (!thumbnail) {
        return '--'
      }
      return [<Image key={thumbnail} thumbnail={thumbnail} urls={urls} {...props} />]
    }
  },
  MyTime: {
    renderDefault(renderOpts, params) {
      const { row, column } = params
      const val = get(row, column.field)
      if (!val) {
        return [<span>--</span>]
      }

      const date = formatDate(val, 'yyyy-MM-dd')
      const time = formatTime(val, 'HH:mm')

      return [
        <span style={{ textAlign: 'center' }}>
          {date} <br /> {time}
        </span>
      ]
    }
  },
  MyDate: {
    renderDefault(renderOpts, params) {
      const { row, column } = params
      const val = get(row, column.field)
      if (!val) {
        return [<span>--</span>]
      }

      const date = formatDate(val, 'yyyy-MM-dd')

      return [<span style={{ textAlign: 'center' }}>{date}</span>]
    }
  }
}

// VXETable渲染器
VXETable.renderer.mixin(cellRenderer)
