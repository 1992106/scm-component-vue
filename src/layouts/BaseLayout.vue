<template>
  <Layout class="layout">
    <LayoutSider
      v-model:collapsed="collapsed"
      :trigger="null"
      collapsible
      class="layout-sider"
      style="background: #fff"
      :collapsed-width="48"
      :width="220">
      <Logo :collapsed="collapsed" />
      <SiderMenu :collapsed="collapsed" />
    </LayoutSider>
    <Layout>
      <AppHeader v-model:collapsed="collapsed" />
      <MultiTabs />
      <LayoutContent class="layout-content">
        <AppMain />
      </LayoutContent>
      <AppFooter />
    </Layout>
  </Layout>
</template>

<script>
import { defineComponent, ref } from 'vue'
import { Layout } from 'ant-design-vue'
import Logo from './logo/index.vue'
import AppHeader from './header'
import SiderMenu from './siderMenu/index.vue'
import MultiTabs from './multiTabs/index.vue'
import AppMain from './main/index.vue'
import AppFooter from './footer'

export default defineComponent({
  name: 'BaseLayout',
  components: {
    Logo,
    AppHeader,
    SiderMenu,
    MultiTabs,
    AppMain,
    AppFooter,
    Layout,
    LayoutContent: Layout.Content,
    LayoutSider: Layout.Sider
  },
  setup() {
    const collapsed = ref(false)

    return {
      collapsed
    }
  }
})
</script>

<style lang="scss" scoped>
.layout {
  display: flex;
  overflow: hidden;
  height: 100vh;

  .layout-sider {
    :deep(.ant-layout-sider-children) {
      display: flex;
      flex-direction: column;
      height: 100%;
    }
  }

  .layout-content {
    overflow-y: auto;
    overflow-x: hidden;
    padding: 12px;
    background-color: #f0f2f5;
  }
}
</style>
