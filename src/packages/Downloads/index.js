// 导入组件
import XDownloads from './src/index.vue'

// 为组件提供 install 安装方法，供按需引入
XDownloads.install = function (app) {
  app.component(XDownloads.name, XDownloads)
}

// 默认导出组件
export default XDownloads
