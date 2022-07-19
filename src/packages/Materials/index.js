// 导入组件
import XMaterials from './src/index.vue'

// 为组件提供 install 安装方法，供按需引入
XMaterials.install = function (app) {
  app.component(XMaterials.name, XMaterials)
}

// 默认导出组件
export default XMaterials
