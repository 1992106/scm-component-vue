<template>
  <div class="multi-tabs">
    <a-tabs
      v-model:activeKey="activeKey"
      hide-add
      type="editable-card"
      class="multi-tabs-box"
      @edit="onEdit"
      @tabClick="onTabClick">
      <a-tab-pane v-for="item in visitedRoutes" :key="item.path" style="height: 0" :closable="visitedRoutes.length > 1">
        <template #tab>
          {{ item.meta.title }}
          <ReloadOutlined v-show="activeKey === item.path" @click.stop.prevent="onRefresh()" />
        </template>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>
<script>
import { defineComponent, unref, watch, computed, ref } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { ReloadOutlined } from '@ant-design/icons-vue'
import { whiteRoutes } from '@src/router'

export default defineComponent({
  name: 'MyMultiTabs',
  components: {
    ReloadOutlined
  },
  setup() {
    const router = useRouter()
    const store = useStore()
    const activeKey = ref('')
    const visitedRoutes = computed(() => store.state.router.visitedRoutes)

    watch(
      () => router.currentRoute.value,
      val => {
        if (whiteRoutes.includes(router.currentRoute.value.name)) {
          return
        }
        activeKey.value = val.path
        addVisitedRoutes()
      },
      { immediate: true }
    )

    function addVisitedRoutes() {
      const { currentRoute } = router
      store.dispatch('router/addVisitedRoutes', unref(currentRoute))
    }

    const onEdit = (key, action) => {
      if (action === 'remove') {
        const { currentRoute } = router
        store.dispatch('router/delVisitedRoutes', { route: unref(currentRoute), key })
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
      store.commit('router/delCachedTabList', route)
      replace({
        path: `/redirect${path}`,
        query,
        params
      })
    }

    return {
      onEdit,
      onTabClick,
      onRefresh,
      visitedRoutes,
      activeKey
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
