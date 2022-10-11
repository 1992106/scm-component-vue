<template>
  <a-popover
    v-bind="$attrs"
    v-model:visible="popoverVisible"
    overlayClassName="x-downloads__overlay"
    :title="title"
    :placement="placement"
    :trigger="trigger">
    <template #content>
      <a-spin :spinning="spinning">
        <DownloadList
          :data="data"
          :rowKey="rowKey"
          :width="width"
          :height="height"
          :customDownload="customDownload"
          :customCancel="customCancel"
          :customDelete="customDelete"
          :empty-text="emptyText" />
      </a-spin>
    </template>
    <a-button shape="circle">
      <template #icon>
        <CloudDownloadOutlined />
      </template>
    </a-button>
  </a-popover>
</template>
<script>
import { computed, defineComponent, reactive, toRefs, watch } from 'vue'
import { Popover } from 'ant-design-vue'
import { CloudDownloadOutlined } from '@ant-design/icons-vue'
import DownloadList from './DownloadList.vue'
import { useTimeoutFn } from '@hooks/useTimeoutFn'
import { isFunction } from 'lodash-es'
import { execRequest } from '@src/utils'
export default defineComponent({
  name: 'XDownloads',
  components: {
    'a-popover': Popover,
    CloudDownloadOutlined,
    DownloadList
  },
  inheritAttrs: false,
  props: {
    visible: { type: Boolean, default: false },
    title: { type: String, default: '下载中心' },
    width: { type: [String, Number], default: 360 },
    height: { type: [String, Number], default: '300' },
    rowKey: { type: [String, Function], default: 'id' },
    placement: { type: String, default: 'bottomRight' },
    trigger: { type: String, default: 'click' },
    customRequest: { type: Function, require: true },
    delay: { type: Number, default: 3000 }, // 默认3秒后自动刷新
    customDownload: { type: Function },
    customCancel: { type: Function },
    customDelete: { type: Function },
    emptyText: { type: String, default: '暂无数据' }
  },
  emits: ['update:visible', 'toggle'],
  setup(props, { emit, expose }) {
    const popoverVisible = computed({
      get: () => {
        return props.visible
      },
      set: val => {
        emit('update:visible', val)
        emit('toggle', val)
      }
    })

    const state = reactive({
      spinning: false,
      data: [],
      total: 0
    })

    const { start, stop } = useTimeoutFn(
      () => {
        handleRequest()
      },
      props.delay,
      { immediate: false }
    )

    watch(
      () => props.visible,
      async visible => {
        if (visible) {
          await handleRequest()
          if (props.delay !== 0) {
            start()
          }
        } else {
          stop()
        }
      },
      { immediate: true }
    )

    const handleRequest = async () => {
      const { customRequest } = props
      if (!isFunction(customRequest)) return
      state.spinning = true
      await execRequest(customRequest(), {
        success: ({ data }) => {
          state.data = data?.list || data?.data || []
          state.total = data?.total || 0
        },
        fail: () => {
          state.data = []
          state.total = 0
        }
      })
      state.spinning = false
    }

    expose({})

    return {
      ...toRefs(state),
      popoverVisible
    }
  }
})
</script>
<style lang="scss">
.x-downloads__overlay {
  .ant-popover-title {
    padding-top: 10px;
    padding-bottom: 8px;
  }

  .ant-popover-inner-content {
    padding: 0;
  }
}
</style>
