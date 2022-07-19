// 导入组件
import XVersions from './src/index.vue'

// 为组件提供 install 安装方法，供按需引入
XVersions.install = function (app) {
  app.component(XVersions.name, XVersions)
}

// 默认导出组件
export default XVersions
