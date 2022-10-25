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
      <template v-if="data.length > 0">
        <div v-if="isNew" class="badge">
          <a-badge color="red" text="有新消息，请点击" />
          <a @click="handlePullDownRefresh">刷新</a>
        </div>
        <a-timeline>
          <a-timeline-item v-for="(item, index) in data" :key="item?.id || index">
            <div>
              {{ formatTime(item?.createAt || item?.createdAt || item?.createTime || item?.createdTime) || '-' }}
            </div>
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
        <Observer v-if="modalVisible && showPagination" :status="status" @intersect="handleReachBottomLoad"></Observer>
      </template>
      <template v-else>
        <a-empty :image="simpleImage" :description="emptyText" />
      </template>
    </x-drawer>
  </a-config-provider>
</template>
<script>
import { defineComponent, reactive, toRefs, watch, watchEffect } from 'vue'
import { Badge, ConfigProvider, Empty, Timeline, TimelineItem } from 'ant-design-vue'
import zhCn from 'ant-design-vue/es/locale/zh_CN'
import { XDrawer } from 'scm-ui-vue'
import Observer from '@components/Log/Observer'
import { isFunction } from 'lodash-es'
import { execRequest, formatTime } from '@src/utils'
export default defineComponent({
  name: 'XLog',
  components: {
    'x-drawer': XDrawer,
    Observer,
    'a-config-provider': ConfigProvider,
    'a-timeline': Timeline,
    'a-timeline-item': TimelineItem,
    'a-empty': Empty,
    'a-badge': Badge
  },
  inheritAttrs: false,
  props: {
    title: { type: String, default: '操作日志' },
    width: { type: [String, Number], default: 360 },
    visible: { type: Boolean, default: false },
    customRequest: { type: Function, require: true },
    showPagination: { type: Boolean, default: false },
    pageSize: { type: Number, default: 10 },
    emptyText: { type: String, default: '暂无数据' }
  },
  emits: ['update:visible', 'done'],
  setup(props, { emit, expose }) {
    const state = reactive({
      modalVisible: props.visible,
      spinning: false,
      isNew: false,
      status: '',
      pageSize: props.pageSize, // 页码
      data: [], // 日志列表
      total: 0 // 总条数
    })

    watchEffect(() => {
      // 使用函数方法调用时不会触发
      state.modalVisible = props.visible
    })

    watchEffect(() => {
      state.pageSize = props.pageSize
    })

    // 初次加载/下拉刷新
    const handlePullDownRefresh = async () => {
      const { customRequest, showPagination } = props
      if (!isFunction(customRequest)) return
      state.spinning = true
      await execRequest(
        customRequest({
          ...(showPagination ? { pageSize: state.pageSize } : {})
        }),
        {
          success: ({ data }) => {
            state.isNew = false
            state.status = ''
            if (showPagination) {
              state.data = data?.data || data?.list || []
              state.total = data?.total || 0
            } else {
              state.data = data || []
              state.total = (data || []).length
            }
            // 如果首次加载时data的长度 === total，则说明已经到底了
            if (state.total > 0 && state.data.length === state.total) {
              state.status = 'end'
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
          handlePullDownRefresh()
        }
      },
      { immediate: true }
    )

    // 触底加载更多
    const handleReachBottomLoad = async () => {
      const { customRequest, showPagination } = props
      if (!isFunction(customRequest) || showPagination) return
      const lastId = state.data[state.data.length - 1]?.id
      state.status = 'loading'
      await execRequest(customRequest({ lastId, pageSize: state.pageSize }), {
        success: ({ data }) => {
          const list = data?.data || data?.list || []
          const total = data?.total || 0
          // 如果触底时，list的长度为0，则说明已经到底了
          if (list.length === 0) {
            state.status = 'end'
          } else {
            state.data.push(...list)
            state.status = 'done'
          }
          // 如果首次加载的total < 触底加载更多的total时，则说明有新数据
          if (state.total < total) {
            state.isNew = true
          }
        },
        fail: () => {
          state.status = 'error'
        }
      })
    }

    const handleOk = () => {
      emit('done', state.data)
      // TODO: 使用函数方法调用时，通过emit('update:visible', false)不生效，必须手动关闭
      state.modalVisible = false // 只是为了兼容使用函数方法调用，才需要手动关闭
      handleCancel()
    }

    const handleCancel = () => {
      state.isNew = false
      state.status = ''
      state.data = []
      state.total = 0
      emit('update:visible', false)
    }

    expose({})

    return {
      zhCn,
      simpleImage: Empty.PRESENTED_IMAGE_SIMPLE,
      ...toRefs(state),
      handlePullDownRefresh,
      handleReachBottomLoad,
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
