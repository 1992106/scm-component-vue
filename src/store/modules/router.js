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
    visitedRoutes: [],
    cachedTabList: []
  },
  mutations: {
    // 添加tab页
    addVisitedRoutes(state, route) {
      const targetIdx = state.visitedRoutes.findIndex(r => r.path === route.path)
      if (targetIdx === -1) {
        state.visitedRoutes.push(route)
      } else {
        state.visitedRoutes.splice(targetIdx, 1, route)
      }
    },
    // 添加进keep-alive列表
    addCachedTabList(state, route) {
      if (
        !route.meta?.ignoreKeepAlive &&
        state.cachedTabList.findIndex(val => val.fullPath === route.fullPath) === -1
      ) {
        state.cachedTabList.push(route)
      }
    },
    // 删除tab页
    delVisitedRoutes(state, { route, key }) {
      const tabLen = state.visitedRoutes?.length
      // 始终保留一个tab
      if (tabLen > 1) {
        const idx = state.visitedRoutes.findIndex(val => val.path === key)
        const isCurrentTab = route.path === key
        let target = {}
        // 如果关闭的是当前tab页
        if (isCurrentTab) {
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
    // 删除keep-alive列表
    delCachedTabList(state, route) {
      if (!state.cachedTabList?.length) return
      const cachedIdx = state.cachedTabList.findIndex(val => val.path === route.fullPath)
      if (cachedIdx !== -1) {
        state.cachedTabList.splice(cachedIdx, 1)
      }
    },
    // 清除
    reset(state) {
      // 使用router.addRoute动态添加路由时，在退出登录的时候需要重置路由
      // resetRouter()
      state.visitedRoutes = []
      state.cachedTabList = []
    }
  },
  actions: {
    // 添加tab页和keep-alive
    addVisitedRoutes({ commit }, route) {
      commit('addVisitedRoutes', route)
      if (setting.keep_alive) {
        commit('addCachedTabList', route)
      }
    },
    // 删除tab页和keep-alive
    delVisitedRoutes({ commit }, { route, key }) {
      commit('delVisitedRoutes', { route, key })
      commit('delCachedTabList', route)
    },
    goToVisitedPage({ state }, _path) {
      const target = state.visitedRoutes.find(item => item.path === _path)
      if (!target) return
      goToPage(target)
    }
  }
}

export default routers
