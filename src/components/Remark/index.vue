<template>
  <x-modal
    v-bind="$attrs"
    v-model:visible="modalVisible"
    class="x-remark__dialog"
    :title="title"
    :width="width"
    :spin-props="spinning"
    :confirm-loading="confirmLoading"
    destroy-on-close
    @ok="handleOk"
    @cancel="handleCancel">
    <x-table
      v-bind="tableOptions"
      v-model:pagination="pages"
      :rowKey="rowKey"
      :showPagination="showPagination"
      :paginationConfig="paginationConfig"
      @search="handleRequest">
      <template #bodyCell="{ column, record: { files, attachments, images } }">
        <template v-if="column.dataIndex === 'files'">
          <template v-if="files.length">
            <template v-if="images.length">
              <x-image :width="50" :height="50" :thumbnail="images[0]?.thumbUrl" :urls="images"></x-image>
            </template>
            <template v-if="attachments.length">
              <a-space>
                <a-button
                  v-for="(file, index) in attachments"
                  :key="file?.id || index"
                  type="link"
                  @click="handleDownload(file)">
                  {{ file?.name || file?.fileName || file?.filename || '查看' }}
                </a-button>
              </a-space>
            </template>
          </template>
          <template v-else>--</template>
        </template>
      </template>
    </x-table>
    <a-form :label-col="{ span: 0 }">
      <a-form-item v-bind="validateInfos['content']">
        <a-textarea
          v-model:value="modelRef.content"
          placeholder="请输入备注"
          :show-count="true"
          :rows="4"
          :maxlength="maxlength" />
      </a-form-item>
      <a-form-item>
        <x-upload
          v-model:file-list="modelRef.fileList"
          :customRequest="customUpload"
          :accept="accept"
          :size="size"
          :maxCount="maxCount"></x-upload>
      </a-form-item>
    </a-form>
  </x-modal>
</template>
<script>
import { reactive, toRefs, defineComponent, watchEffect, watch } from 'vue'
import { Button, Form, FormItem, Space, Textarea } from 'ant-design-vue'
import { XModal, XTable, XUpload, XImage } from 'scm-ui-vue'
import { isFunction } from 'lodash-es'
import { formatTime, isEmpty, execRequest, download } from '@src/utils'
import { hasImage } from '@components/utils'
export default defineComponent({
  name: 'XRemark',
  components: {
    'x-modal': XModal,
    'x-table': XTable,
    'x-upload': XUpload,
    'x-image': XImage,
    'a-form': Form,
    'a-form-item': FormItem,
    'a-textarea': Textarea,
    'a-space': Space,
    'a-button': Button
  },
  inheritAttrs: false,
  props: {
    title: { type: String, default: '备注' },
    width: { type: [String, Number], default: 960 },
    visible: { type: Boolean, default: false },
    rowKey: { type: [String, Function], default: 'id' },
    scrollY: { type: [String, Number], default: 360 },
    maxlength: { type: Number, default: 200 },
    customRequest: { type: Function, require: true },
    customSubmit: { type: Function },
    customUpload: { type: Function },
    accept: { type: String, default: 'image/*' },
    size: { type: Number, default: 3 },
    maxCount: { type: Number, default: 1 },
    showPagination: { type: Boolean, default: false },
    pagination: { type: Object, default: () => ({ page: 1, pageSize: 10 }) },
    paginationConfig: { type: Object, default: () => ({ showLessItems: true }) },
    emptyText: { type: String, default: '暂无数据' }
  },
  emits: ['update:visible', 'done'],
  setup(props, { emit, expose }) {
    const state = reactive({
      modalVisible: props.visible,
      spinning: false,
      confirmLoading: false,
      pages: props.pagination
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

    const tableOptions = reactive({
      scroll: {
        y: props.scrollY
      },
      rowKey: props.rowKey,
      size: 'small',
      columns: [
        {
          title: '备注人',
          width: 100,
          customRender: ({ record }) => {
            return record?.createUser || record?.createdUser
          }
        },
        {
          title: '备注时间',
          width: 160,
          customRender: ({ record }) => {
            const text = record?.createAt || record?.createdAt || record?.createTime || record?.createdTime
            return formatTime(text)
          }
        },
        { title: '备注内容', dataIndex: 'content' },
        { title: '附件', width: 120, dataIndex: 'files', ellipsis: true }
      ],
      dataSource: [],
      total: 0
    })

    const getFiles = row => {
      const files = row?.files || row?.fileList || row?.images || row?.imageList || row?.resources || row?.attachments
      return isEmpty(files) ? [] : Array.isArray(files) ? files : [files]
    }

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
            if (showPagination) {
              const list = data?.data ?? data?.list ?? []
              tableOptions.dataSource = list.map(row => {
                const files = getFiles(row)
                const images = files.filter(file => hasImage(file))
                const attachments = files.filter(file => !hasImage(file))
                const content = row?.remark || row?.content
                return {
                  ...row,
                  content,
                  files,
                  images,
                  attachments
                }
              })
              tableOptions.total = data?.total || 0
            } else {
              tableOptions.dataSource = (data || []).map(row => {
                const files = getFiles(row)
                const images = files.filter(file => hasImage(file))
                const attachments = files.filter(file => !hasImage(file))
                const content = row?.remark || row?.content
                return {
                  ...row,
                  content,
                  files,
                  images,
                  attachments
                }
              })
              tableOptions.total = (data || []).length
            }
          },
          fail: () => {
            tableOptions.dataSource = []
            tableOptions.total = 0
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

    const handleDownload = file => {
      download(file?.url || file?.thumbUrl, file?.name || file?.fileName || file?.filename)
    }

    const modelRef = reactive({
      content: '',
      fileList: []
    })

    const rulesRef = reactive({
      content: [{ required: true, message: '请输入备注' }]
    })

    const { resetFields, validate, validateInfos } = Form.useForm(modelRef, rulesRef)

    const handleOk = async () => {
      const { customSubmit } = props
      if (!isFunction(customSubmit)) return
      validate()
        .then(async () => {
          state.confirmLoading = true
          const { content, fileList } = modelRef
          const files = fileList.filter(val => val?.status === 'done')
          await execRequest(
            customSubmit({
              content,
              ...(!isEmpty(files) ? { ids: files.map(val => val?.uid), files } : {})
            }),
            {
              success: ({ data }) => {
                emit('done', data)
                // TODO: 使用函数方法调用时，通过emit('update:visible', false)不生效，必须手动关闭
                // state.modalVisible = false // 只是为了兼容使用函数方法调用，才需要手动关闭
                handleCancel()
              }
            }
          )
          state.confirmLoading = false
        })
        .catch(err => {
          console.error('remark error', err)
        })
    }

    const handleCancel = () => {
      resetFields()
      tableOptions.dataSource = []
      tableOptions.total = 0
      emit('update:visible', false)
    }

    expose({})

    return {
      ...toRefs(state),
      tableOptions,
      handleRequest,
      modelRef,
      validateInfos,
      handleDownload,
      handleOk,
      handleCancel
    }
  }
})
</script>
<style lang="scss" scoped>
.x-remark__dialog {
  .x-table {
    .ant-btn-link {
      white-space: normal;
      word-break: break-word;
    }
  }

  .ant-form {
    margin-top: 20px;

    .ant-form-item {
      margin-bottom: 10px;

      &:last-of-type {
        height: 112px;
        margin-bottom: 0;
      }
    }
  }
}
</style>
