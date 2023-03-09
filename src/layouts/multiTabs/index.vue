<template>
  <div class="multi-tabs">
    <a-tabs
      v-model:activeKey="activeKey"
      hide-add
      type="editable-card"
      class="multi-tabs-box"
      @edit="onEdit"
      @tabClick="onTabClick">
      <a-tab-pane v-for="(item, index) in menuList" :key="item.path" style="height: 0" :closable="menuList.length > 1">
        <template #tab>
          <a-dropdown :trigger="['contextmenu']">
            <div>
              {{ item.meta.title }}
              <ReloadOutlined v-show="activeKey === item.path" @click.stop.prevent="onRefresh()" />
            </div>
            <template #overlay>
              <a-menu class="context-menu" @click="onContextmenu($event, item.path, index)">
                <a-menu-item key="refresh" :disabled="activeKey !== item.path">
                  <ReloadOutlined />
                  重新加载
                </a-menu-item>
                <a-menu-item key="other" :disabled="menuList.length === 1">
                  <PicCenterOutlined />
                  关闭其它
                </a-menu-item>
                <a-menu-divider />
                <a-menu-item key="left" :disabled="index === 0">
                  <VerticalRightOutlined />
                  关闭左侧
                </a-menu-item>
                <a-menu-item key="right" :disabled="index + 1 === menuList.length">
                  <VerticalLeftOutlined />
                  关闭右侧
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </template>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>
<script>
import { defineComponent, unref, watch, computed, ref } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { ReloadOutlined, PicCenterOutlined, VerticalRightOutlined, VerticalLeftOutlined } from '@ant-design/icons-vue'
import { whiteRoutes } from '@src/router'

export default defineComponent({
  name: 'AppMultiTabs',
  components: {
    ReloadOutlined,
    PicCenterOutlined,
    VerticalRightOutlined,
    VerticalLeftOutlined
  },
  setup() {
    const router = useRouter()
    const store = useStore()
    const activeKey = ref('')
    const menuList = computed(() => store.getters['router/visitedRoutes'])

    watch(
      () => router.currentRoute.value,
      currentRoute => {
        if (whiteRoutes.includes(currentRoute.name)) {
          return
        }
        activeKey.value = currentRoute.path
        store.dispatch('router/addVisitedRoute', unref(currentRoute))
      },
      { immediate: true }
    )

    const onEdit = (key, action) => {
      const route = menuList.value.find(item => item.path === key)
      if (action === 'remove' && route) {
        store.dispatch('router/delVisitedRoute', route)
      }
    }

    const onTabClick = key => {
      if (key !== router.currentRoute.value.path) {
        store.dispatch('router/goToVisitedPage', key)
      }
    }

    const onRefresh = () => {
      const { currentRoute, replace } = router
      const route = unref(currentRoute)
      const { path, params, query } = route
      store.commit('router/delCachedRoute', route)
      replace({
        path: `/redirect${path}`,
        query,
        params
      })
    }

    const onContextmenu = (action, key, index) => {
      switch (action.key) {
        // 重新加载
        case 'refresh':
          onRefresh()
          break
        // 关闭其它
        case 'other':
          // eslint-disable-next-line no-case-declarations
          const otherRoutes = menuList.value.filter(val => val.path !== key)
          store.dispatch('router/delVisitedRoutes', { routes: otherRoutes, key })
          break
        // 关闭左侧
        case 'left':
          // eslint-disable-next-line no-case-declarations
          const leftRoutes = menuList.value.slice(0, index)
          store.dispatch('router/delVisitedRoutes', { routes: leftRoutes, key })
          break
        // 关闭右侧
        case 'right':
          // eslint-disable-next-line no-case-declarations
          const rightRoutes = menuList.value.slice(index + 1)
          store.dispatch('router/delVisitedRoutes', { routes: rightRoutes, key })
          break
      }
    }

    return {
      activeKey,
      menuList,
      onEdit,
      onTabClick,
      onRefresh,
      onContextmenu
    }
  }
})
</script>

<style lang="scss" scoped>
.multi-tabs-box {
  background: $bg-color;
  margin: 0;
  padding-top: 6px;

  :deep(.ant-tabs-bar) {
    padding-left: 16px;
    margin-bottom: 0;

    .anticon {
      margin: 0 0 0 8px;
      color: rgb(0 0 0 / 45%);
      font-size: 12px;
      width: 16px;
      height: 14px;
      overflow: hidden;
      vertical-align: middle;
      transition: all 0.3s;

      &:hover {
        color: rgb(0 0 0 / 85%);
      }
    }
  }
}
</style>
