<template>
  <div class="x-download__list" :style="getStyle">
    <template v-if="list.length">
      <div v-for="(file, index) in list" :key="getValueByRowKey(rowKey, file, index)" class="x-download__item">
        <div class="x-download__item-icon">
          <FileExcelOutlined />
        </div>
        <div class="x-download__item-box" :style="{ color: file?.exportResult === -1 ? '#ccc' : '' }">
          <div class="name" :title="file?.fileName">{{ file?.fileName }}</div>
          <div class="actions">
            <p v-if="file?.taskStatus === 0">
              <a @click="handleCancel(file)">取消</a>
            </p>
            <p v-if="file?.taskStatus === 1">正在下载中...</p>
            <template v-if="file?.taskStatus === 2">
              <a v-if="file?.exportResult === 1" @click="handleDownload(file)">下载</a>
              <p v-else>
                导出失败
                <a @click="handleDelete(file)">删除</a>
              </p>
            </template>
          </div>
        </div>
      </div>
    </template>
    <template v-else>
      <a-empty :image="simpleImage" :description="emptyText" />
    </template>
  </div>
</template>
<script>
import { computed, defineComponent, reactive, toRefs, watchEffect } from 'vue'
import { Empty } from 'ant-design-vue'
import { FileExcelOutlined } from '@ant-design/icons-vue'
import { isFunction } from 'lodash-es'
import { getValueByRowKey } from '@components/utils'
import { download, execRequest, getStyleSize } from '@src/utils'
export default defineComponent({
  name: 'DownloadList',
  components: {
    FileExcelOutlined,
    'a-empty': Empty
  },
  inheritAttrs: false,
  props: {
    width: [String, Number],
    height: [String, Number],
    data: { type: Array, default: () => [] },
    rowKey: [String, Function],
    customDownload: Function,
    customCancel: Function,
    customDelete: Function,
    emptyText: String
  },
  setup(props) {
    const getStyle = computed(() => {
      return getStyleSize({ width: props.width, maxHeight: props.height })
    })

    const state = reactive({
      list: props.data
    })

    watchEffect(() => {
      state.list = props.data
    })

    const handleDownload = async row => {
      const { customDownload } = props
      if (!isFunction(customDownload)) return
      await execRequest(customDownload(row), {
        success: ({ data }) => {
          if (data) {
            download(data?.url, data?.fileName)
          }
        }
      })
    }

    const handleCancel = async row => {
      const { customCancel } = props
      if (!isFunction(customCancel)) return
      await execRequest(customCancel(row))
    }

    const handleDelete = async row => {
      const { customDelete, rowKey } = props
      if (!isFunction(customDelete)) return
      await execRequest(customDelete(row), {
        success: () => {
          // 手动删除
          const index = state.list.findIndex(val => getValueByRowKey(rowKey, val) === getValueByRowKey(rowKey, row))
          state.list.splice(index, 1)
        }
      })
    }

    return {
      simpleImage: Empty.PRESENTED_IMAGE_SIMPLE,
      ...toRefs(state),
      getStyle,
      handleDownload,
      handleCancel,
      handleDelete,
      getValueByRowKey
    }
  }
})
</script>
<style lang="scss" scoped>
.x-downloads__overlay {
  .x-download__list {
    overflow-x: hidden;
    overflow-y: auto;
    padding: 12px 16px;

    .x-download__item {
      display: flex;
      flex-direction: row;
      align-items: center;
      margin-bottom: 10px;

      &-icon {
        width: 30px;
        text-align: left;
        font-size: 20px;
      }

      &-box {
        display: flex;
        flex-direction: column;
        justify-content: center;
        flex: 1;

        & > .name {
          @include ellipsis;
        }

        & > .actions {
          & > p {
            font-size: 12px;
            margin-bottom: 0;
          }

          a {
            text-decoration: underline;
          }
        }
      }
    }
  }
}
</style>
