// 导入组件
import XTraceability from './src/index.vue'
import XBatchImportTraceability from './src/BatchImportTraceability.vue'
import XBatchImportDetail from './src/BatchImportDetail.vue'
import XEditTraceability from './src/EditTraceability.vue'
import XAuditTraceability from './src/AuditTraceability.vue'
import XViewTraceability from './src/ViewTraceability.vue'

// 为组件提供 install 安装方法，供按需引入
XTraceability.install = function (app) {
  app.component(XTraceability.name, XTraceability)
}
XBatchImportTraceability.install = function (app) {
  app.component(XBatchImportTraceability.name, XBatchImportTraceability)
}
XBatchImportDetail.install = function (app) {
  app.component(XBatchImportDetail.name, XBatchImportDetail)
}
XEditTraceability.install = function (app) {
  app.component(XEditTraceability.name, XEditTraceability)
}
XAuditTraceability.install = function (app) {
  app.component(XAuditTraceability.name, XAuditTraceability)
}
XViewTraceability.install = function (app) {
  app.component(XViewTraceability.name, XViewTraceability)
}

// 默认导出组件
export default XTraceability
export { XBatchImportTraceability, XBatchImportDetail, XEditTraceability, XAuditTraceability, XViewTraceability }
