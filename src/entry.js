import * as packages from '@packages/index'

const install = function installComponents(app) {
  const list = [...Object.entries(packages)]
  list.forEach(([componentName, component]) => {
    app.component(componentName, component)
  })
}

export default install

// 组件
export * from '@packages/index'

// 函数调用
export * from '@packages/create'

// export { VXETablePluginSCM } from './plugins/VXETablePluginSCM'
