<template>
  <div class="menus">
    <a-menu
      mode="inline"
      style="border: 0 none"
      :selected-keys="selectedKeys"
      :open-keys="openKeys"
      @click="onClick"
      @openChange="onOpenChange">
      <template v-for="item in allRoutes" :key="item.name">
        <MenuItem :collapsed="collapsed" :menu-info="item" />
      </template>
    </a-menu>
  </div>
</template>

<script>
import { defineComponent, reactive, watch, computed, toRefs } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MenuItem from './item.vue'
import { routes, whiteRoutes } from '@src/router'

export default defineComponent({
  name: 'AppSiderMenu',
  components: {
    MenuItem
  },
  props: {
    collapsed: {
      // 侧边栏菜单是否收起
      type: Boolean
    }
  },
  setup(props) {
    const router = useRouter()
    const currentRoute = useRoute()

    const state = reactive({
      openKeys: getOpenKeys(), // menu当前展开的keys
      selectedKeys: [currentRoute.name], // menu选中的keys
      allRoutes: routes.flatMap(val => (val.path === '/' ? val?.children || [] : [val]))
    })

    // 监听菜单收缩状态 && 跟随页面路由变化，切换菜单选中状态
    watch(
      () => [props.collapsed, currentRoute.fullPath],
      () => {
        if (whiteRoutes.includes(currentRoute.name)) return
        state.openKeys = getOpenKeys()
        state.selectedKeys = [currentRoute.name]
      }
    )

    // 获取当前打开的子菜单
    function getOpenKeys() {
      return props.collapsed ? [] : currentRoute.matched.slice(0, -1).map(item => item.name)
    }

    // 点击菜单
    function onClick({ key }) {
      router.push({ name: key })
    }

    // 从routes筛选所有根菜单的名字
    const rootMenuKeys = computed(() =>
      state.allRoutes.filter(item => !!item?.children?.length && item.path !== '/').map(item => item.name)
    )
    // 展开菜单
    function onOpenChange(openKeys) {
      const latestOpenKey = openKeys.find(key => state.openKeys.indexOf(key) === -1)
      if (rootMenuKeys.value.indexOf(latestOpenKey) === -1) {
        state.openKeys = openKeys
      } else {
        state.openKeys = latestOpenKey ? [latestOpenKey] : []
      }
    }

    return {
      ...toRefs(state),
      onClick,
      onOpenChange
    }
  }
})
</script>

<style lang="scss" scoped>
.menus {
  flex: 1 1 0;
  overflow: hidden auto;
  background-color: $bg-color;
  box-shadow: 2px 0 8px 0 rgb(29 35 41 / 5%);
  position: relative;
  z-index: 20;

  &::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgb(0 0 0 / 6%);
    border-radius: 3px;
    box-shadow: inset 0 0 5px rgb(37 37 37 / 5%);
  }

  &::-webkit-scrollbar-thumb {
    background: rgb(0 0 0 / 12%);
    border-radius: 3px;
    box-shadow: inset 0 0 5px rgb(0 21 41 / 5%);
  }

  :deep(.ant-menu-inline) {
    // border-right: 1px solid #bfbfbf;
    .ant-menu-item {
      width: 100%;
    }
  }

  :deep(.ant-menu-inline-collapsed) {
    width: 48px;

    .ant-menu-item,
    .ant-menu-submenu-title {
      width: 48px;
      padding: 0 16px !important;
    }
  }

  :deep(.ant-menu-vertical) {
    .ant-menu-submenu {
      padding-bottom: 0.02px;
    }
  }
}
</style>
