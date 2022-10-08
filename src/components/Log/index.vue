<template>
  <a-config-provider :locale="zhCn">
    <x-drawer
      v-bind="$attrs"
      v-model:visible="modalVisible"
      class="x-log__dialog"
      :title="title"
      :width="width"
      :spin-props="spinning"
      :footer="null"
      destroy-on-close
      @cancel="handleCancel"
      @ok="handleOk">
      <a-timeline v-if="data.length > 0">
        <a-timeline-item v-for="(item, index) in data" :key="item?.id || index">
          <div>{{ formatTime(item?.createAt || item?.createdAt || item?.createTime || item?.createdTime) || '-' }}</div>
          <div>
            {{ item?.createUser || item?.createdUser || '-' }}
            <span>操作了</span>
            <template v-if="item?.action">
              <span class="color">【{{ item?.action }}】</span>
              <div v-if="item?.content">
                <template v-if="Array.isArray(item?.content)">
                  <p v-for="(text, i) in item?.content" :key="text || i">{{ text }}</p>
                </template>
                <p v-else>{{ item?.content }}</p>
              </div>
              <template v-else>--</template>
            </template>
            <template v-else>
              <template v-if="item?.content">
                <span class="color" v-html="'【' + item?.content + '】'"></span>
              </template>
              <template v-else>--</template>
            </template>
          </div>
        </a-timeline-item>
      </a-timeline>
      <template v-else>
        <a-empty :image="simpleImage" :description="emptyText" />
      </template>
    </x-drawer>
  </a-config-provider>
</template>
<script>
import { defineComponent, reactive, toRefs, watch, watchEffect } from 'vue'
import { ConfigProvider, Empty, Timeline, TimelineItem } from 'ant-design-vue'
import zhCn from 'ant-design-vue/es/locale/zh_CN'
import { XDrawer } from 'scm-ui-vue'
import { isFunction } from 'lodash-es'
import { execRequest, formatTime, isEmpty } from '@src/utils'
export default defineComponent({
  name: 'XLog',
  components: {
    'x-drawer': XDrawer,
    'a-config-provider': ConfigProvider,
    'a-timeline': Timeline,
    'a-timeline-item': TimelineItem,
    'a-empty': Empty
  },
  inheritAttrs: false,
  props: {
    title: { type: String, default: '操作日志' },
    width: { type: [String, Number], default: 360 },
    visible: { type: Boolean, default: false },
    customRequest: { type: Function, require: true },
    showPagination: { type: Boolean, default: false },
    pagination: { type: Object, default: () => ({ page: 1, pageSize: 10 }) },
    paginationConfig: { type: Object, default: () => ({ showLessItems: true }) },
    emptyText: { type: String, default: '暂无数据' }
  },
  emits: ['update:visible', 'done'],
  setup(props, { emit }) {
    const state = reactive({
      modalVisible: props.visible,
      spinning: false,
      data: [],
      pages: props.pagination,
      total: 0
    })

    watchEffect(() => {
      // 使用函数方法调用时不会触发
      state.modalVisible = props.visible
    })

    watchEffect(() => {
      if (!isEmpty(props.pagination)) {
        state.pages = props.pagination
      }
    })

    const handleRequest = async () => {
      const { customRequest, showPagination } = props
      if (!isFunction(customRequest)) return
      state.spinning = true
      await execRequest(
        customRequest({
          ...(showPagination ? state.pages : {})
        }),
        {
          success: ({ data }) => {
            // TODO
            if (showPagination) {
              state.data = data?.data || data?.list || []
              state.total = data?.total || 0
            } else {
              state.data = data || []
              state.total = (data || []).length
            }
          },
          fail: () => {
            state.data = []
            state.total = 0
          }
        }
      )
      state.spinning = false
    }

    watch(
      () => props.visible,
      bool => {
        if (bool) {
          handleRequest()
        }
      },
      { immediate: true }
    )

    const handleOk = () => {
      emit('done')
      // TODO: 使用函数方法调用时，通过emit('update:visible', false)不生效，必须手动关闭。
      state.modalVisible = false // 只是为了兼容使用函数方法调用，才需要手动关闭
      handleCancel()
    }

    const handleCancel = () => {
      state.data = []
      state.total = 0
      emit('update:visible', false)
    }

    return {
      zhCn,
      simpleImage: Empty.PRESENTED_IMAGE_SIMPLE,
      ...toRefs(state),
      handleOk,
      handleCancel,
      formatTime
    }
  }
})
</script>
<style lang="scss" scoped>
.x-log__dialog {
  .color {
    color: $color-primary;
  }
}
</style>
