import { cellRenderer } from './vxe-table/cellRenderer'
import { formats } from './vxe-table/formats'

// VXETable渲染器
export const VXETablePluginSCM = {
  install(vxetablecore) {
    const { renderer } = vxetablecore

    renderer.mixin(cellRenderer)
    renderer.mixin(formats)
  }
}
