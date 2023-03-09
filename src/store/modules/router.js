import router from '@src/router'
import setting from '@src/config'
import { isEmpty } from '@src/utils'

const goToPage = route => {
  const { name, params, query, path } = route

  if (!isEmpty(params)) {
    router.push({ path, params })
  } else if (!isEmpty(name)) {
    router.push({ name, params, query })
  } else {
    console.warn(`参数缺失：router->【${path}】"name"缺失`)
  }
}

const routers = {
  state: {
    dynamicRoutes: [], // 动态路由
    visitedRoutes: [], // 已访问路由
    cachedRoutes: [] // 已缓存路由
  },
  getters: {
    dynamicRoutes: state => state.dynamicRoutes,
    visitedRoutes: state => state.visitedRoutes,
    cachedRoutes: state => state.cachedRoutes
  },
  mutations: {
    // 添加顶部tab页
    addVisitedRoute(state, route) {
      const targetIdx = state.visitedRoutes.findIndex(val => val.path === route.path)
      if (targetIdx === -1) {
        state.visitedRoutes.push(route)
      } else {
        state.visitedRoutes.splice(targetIdx, 1, route)
      }
    },
    // 添加进keep-alive列表
    addCachedRoute(state, route) {
      if (route.meta.ignoreKeepAlive === true) return
      const cachedIdx = state.cachedRoutes.findIndex(val => val.fullPath === route.fullPath)
      if (cachedIdx === -1) {
        state.cachedRoutes.push(route)
      }
    },
    // 删除顶部tab页
    delVisitedRoute(state, route) {
      const tabLen = state.visitedRoutes.length
      // 始终保留一个tab
      if (tabLen > 1) {
        const idx = state.visitedRoutes.findIndex(val => val.path === route.path)
        const isCurrentTab = router.currentRoute.value.path === route.path
        // 如果关闭的是当前tab页
        if (isCurrentTab) {
          let target = {}
          // 如果是最后一个tab页，则需要往前移一个tab
          if (idx === tabLen - 1) {
            target = state.visitedRoutes[idx - 1]
          } else {
            target = state.visitedRoutes[idx + 1]
          }
          goToPage(target)
        }
        state.visitedRoutes.splice(idx, 1)
      }
    },
    delVisitedRoutes(state, { routes, key }) {
      // 始终保留一个tab
      if (state.visitedRoutes.length > 1) {
        const keys = routes.map(val => val.path)
        state.visitedRoutes = state.visitedRoutes.filter(val => !keys.includes(val.path))

        const isCurrentTab = routes.find(val => val.path === router.currentRoute.value.path)
        // 如果关闭的包含当前tab页
        if (isCurrentTab) {
          const target = state.visitedRoutes.find(val => val.path === key)
          if (target) {
            goToPage(target)
          }
        }
      }
    },
    // 删除keep-alive列表中的一项
    delCachedRoute(state, route) {
      if (state.cachedRoutes.length === 0) return
      const cachedIdx = state.cachedRoutes.findIndex(val => val.fullPath === route.fullPath)
      if (cachedIdx !== -1) {
        state.cachedRoutes.splice(cachedIdx, 1)
      }
    },
    delCachedRoutes(state, routes) {
      if (state.cachedRoutes.length === 0) return
      const cachedKeys = routes.map(val => val.path)
      state.cachedRoutes = state.cachedRoutes.filter(val => !cachedKeys.includes(val.path))
    },
    // 清除
    reset(state) {
      // 使用router.addRoute动态添加路由时，在退出登录的时候需要重置路由
      // resetRouter()
      state.dynamicRoutes = []
      state.visitedRoutes = []
      state.cachedRoutes = []
    }
  },
  actions: {
    // 添加顶部tab页和keep-alive
    addVisitedRoute({ commit }, route) {
      commit('addVisitedRoute', route)
      if (setting.keep_alive) {
        commit('addCachedRoute', route)
      }
    },
    // 删除顶部tab页和keep-alive
    delVisitedRoute({ commit }, route) {
      commit('delVisitedRoute', route)
      if (setting.keep_alive) {
        commit('delCachedRoute', route)
      }
    },
    delVisitedRoutes({ commit }, { routes, key }) {
      commit('delVisitedRoutes', { routes, key })
      if (setting.keep_alive) {
        commit('delCachedRoutes', routes)
      }
    },
    goToVisitedPage({ state }, key) {
      const target = state.visitedRoutes.find(val => val.path === key)
      if (target) {
        goToPage(target)
      }
    }
  }
}

export default routers
