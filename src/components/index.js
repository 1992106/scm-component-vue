// 通用组件
export { default as XBarcode } from './Barcode/index.vue'
export { default as XQrcode } from './Qrcode/index.vue'
export { default as XPrint } from './Print/index.vue'
export { default as XImport } from './Import/index.vue' // 下个版本删除
export { default as XExport } from './Export/index.vue'
export { default as XLog } from './Log/index.vue'
export { default as XRemark } from './Remark/index.vue'
export { default as XEcharts } from './Echarts/index.vue'
export { default as XEditor } from './Editor/index.vue'

// 全局和按需引入
export { default as XDownloads } from './Downloads'
export { default as XVersions } from './Versions'
export { default as XMaterials } from './Materials'
export {
  default as XTraceability,
  XBatchImportTraceability,
  XBatchImportDetail,
  XCopyTraceability,
  XEditTraceability,
  XAuditTraceability,
  XViewTraceability
} from './Traceability'
