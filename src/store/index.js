import { createStore } from 'vuex'

// 加载所有模块。
function loadModules() {
  const context = import.meta.glob('./modules/*.js', { eager: true })
  const modules = Object.keys(context)
    .map(key => ({
      key,
      name: key.match(/([a-z_]+)\.js$/i)[1]
    }))
    .reduce((m, item) => {
      return {
        ...m,
        [item.name]: {
          ...context[item.key].default,
          namespaced: true // 默认打开命名空间
        }
      }
    }, {})
  return { context, modules }
}

const { context, modules } = loadModules()

const store = createStore({
  modules
})

if (import.meta.hot) {
  console.log({ hot: import.meta.hot, contextId: context.id }, 'Vuex 热重载测试')
  // 在任何模块发生改变时进行热重载。
  import.meta.hot.accept(context.id, () => {
    store.hotUpdate({
      modules: loadModules().modules
    })
  })
}

export default store
