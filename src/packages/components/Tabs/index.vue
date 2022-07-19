<template>
  <a-tabs v-bind="$attrs" v-model:activeKey="activeKey" class="x-tabs" :size="size" @change="handleChange">
    <a-tab-pane v-for="tab in tabs" :key="tab?.value" :tab="tab?.label">
      <template v-if="tab?.value === activeKey">
        <slot></slot>
      </template>
    </a-tab-pane>
  </a-tabs>
</template>

<script>
import { defineComponent, reactive, toRefs, watch } from 'vue'
import { useRoute } from 'vue-router'

export default defineComponent({
  name: 'XTabs',
  inheritAttrs: false,
  props: {
    value: [String, Number],
    list: { type: Array, default: () => [] }, // { label: '', value: '' }
    size: { type: String, default: 'small' }
  },
  emits: ['update:value', 'click'],
  setup(props, { emit }) {
    const route = useRoute()

    const state = reactive({
      tabs: [],
      activeKey: ''
    })

    const onInit = () => {
      state.tabs = props.list
      state.activeKey = props.value || route.query?.key || state.tabs[0]?.value
      emit('update:value', state.activeKey)
    }

    const handleChange = $event => {
      emit('update:value', $event)
      emit('click', $event)
      // await router.replace({ query: { key: $event } })
    }

    watch(
      () => props.value,
      val => {
        state.activeKey = val
      }
    )

    onInit()

    return {
      ...toRefs(state),
      handleChange
    }
  }
})
</script>
<style lang="scss" scoped>
.x-tabs {
  height: 100%;
  background-color: #f0f2f5;

  &.ant-tabs {
    :deep(.ant-tabs-nav) {
      padding: 5px 20px 10px;
      margin-bottom: 10px;
      background-color: $bg-color;
    }

    :deep(.ant-tabs-content-holder) {
      height: calc(100% - 62px);

      .ant-tabs-content {
        height: 100%;
      }
    }
  }
}
</style>
