import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/antd.css'
import ScmUI from 'scm-ui-vue'
import 'scm-ui-vue/dist/style.css'
// 引入ScmComponent组件
import ScmComponent from '../entry'

// 本地全局组件
const localComponents = []

export function setupPlugins(app) {
  // 注册本地全局组件
  localComponents.forEach(component => {
    app.component(component.name, component)
  })
  // 注册ant-design-vue
  app.use(Antd)
  // 注册scm-ui-vue
  app.use(ScmUI)
  // 注册scm-component
  app.use(ScmComponent)
  return app
}
