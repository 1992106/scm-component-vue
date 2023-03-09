import router from '@src/router'

// 解析动态路由 => 生成树形菜单
export const parseRoutes = (routes = [], menus = []) => {
  for (let i = 0; i < routes.length; i++) {
    const route = routes[i]
    const { children, ...others } = route
    const tmpRoute = { ...others } // copy
    if (children) {
      tmpRoute.children = []
      const submenu = parseRoutes(children, tmpRoute.children)
      if (submenu.length) {
        tmpRoute.meta.sort = route.meta?.sort || 0
        tmpRoute.meta.title = route.meta?.title
        menus.push(tmpRoute)
      }
    } else {
      tmpRoute.meta.sort = route.meta?.sort || 0
      tmpRoute.meta.title = route.meta?.title
      menus.push(tmpRoute)
    }
  }
  return menus
}

// 拍平动态路由 => 动态添加路由
export const flatRoutes = (routes = [], parentRoute) => {
  return routes.reduce((list, route) => {
    // 拼接全路径路由
    if (parentRoute && parentRoute.path !== '/') {
      route.fullPath = `${parentRoute.fullPath || parentRoute.path}/${route.path}`
    } else {
      route.fullPath = route.path
    }
    // 保存路由名，菜单使用
    const parentMenus = parentRoute?.meta?.menus || []
    if (!route.meta) route.meta = { title: route.name }
    route.meta.menus = [...parentMenus, route.name]
    if (route.children && route.children.length) {
      const childrenRes = flatRoutes(route.children, route)
      list.push(...childrenRes)
    } else {
      const { fullPath, ...others } = route
      list.push({ ...others, path: fullPath })
    }
    return list
  }, [])
}

// 添加动态路由
export const addDynamicRouters = (routes = []) => {
  const routeList = flatRoutes(routes)
  routeList.forEach(route => {
    router.addRoute('Index', route)
  })
}
