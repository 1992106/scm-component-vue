<template>
  <template v-if="!menuInfo?.meta?.hidden">
    <a-sub-menu v-if="menuInfo.children?.length" :key="menuInfo.name">
      <template #title>
        <span>
          <icon-font v-if="menuInfo.meta?.icon" :type="menuInfo.meta.icon" />
          <span>{{ !collapsed ? menuInfo.meta?.title : menuInfo.meta?.title?.at?.() }}</span>
        </span>
      </template>
      <template v-for="item in menuInfo.children">
        <template v-if="!item.children">
          <a-menu-item v-if="!item?.meta?.hidden" :key="item.name">
            <icon-font v-if="item.meta?.icon" :type="item.meta.icon" />
            <span>{{ item.meta?.title }}</span>
          </a-menu-item>
        </template>
        <template v-else>
          <MenuItem :key="item.name" :menu-info="item" />
        </template>
      </template>
    </a-sub-menu>
    <a-menu-item v-else :key="menuInfo.name" :title="menuInfo.meta?.title">
      <icon-font v-if="menuInfo.meta?.icon" :type="menuInfo.meta.icon" />
      <span>{{ !collapsed ? menuInfo.meta?.title : menuInfo.meta?.title?.at?.() }}</span>
    </a-menu-item>
  </template>
</template>
<script>
import { defineComponent } from 'vue'
import IconFont from '@components/IconFont'

export default defineComponent({
  name: 'MenuItem',
  components: {
    IconFont
  },
  props: {
    collapsed: { type: Boolean },
    menuInfo: {
      type: Object,
      default: () => ({})
    }
  }
})
</script>
