<template>
  <a-config-provider :locale="zhCn">
    <x-modal
      v-bind="$attrs"
      v-model:visible="modalVisible"
      class="x-remark__dialog"
      :title="title"
      :width="width"
      destroy-on-close
      :spin-props="spinning"
      :confirm-loading="confirmLoading"
      @ok="handleOk"
      @cancel="handleCancel">
      <x-table
        v-bind="tableOptions"
        v-model:pagination="pages"
        :rowKey="rowKey"
        :showPagination="showPagination"
        :paginationConfig="paginationConfig"
        @search="handleRequest">
        <template #bodyCell="{ column, record: { attachments } }">
          <template v-if="column.dataIndex === 'attachments'">
            <template v-if="attachments.length">
              <template v-if="attachments[0]?.fileName">
                <a-space>
                  <a-button
                    v-for="(file, index) in attachments"
                    :key="file?.id || index"
                    type="link"
                    @click="handleDownload(file)">
                    {{ file?.fileName }}
                  </a-button>
                </a-space>
              </template>
              <template v-else>
                <x-image :width="50" :height="50" :thumbnail="attachments[0]?.thumbUrl" :urls="attachments"></x-image>
              </template>
            </template>
            <template v-else>--</template>
          </template>
        </template>
      </x-table>
      <a-form :label-col="{ span: 0 }">
        <a-form-item v-bind="validateInfos.content">
          <a-textarea
            v-model:value="modelRef.content"
            placeholder="请输入备注"
            show-count
            :rows="4"
            :maxlength="maxlength" />
        </a-form-item>
        <a-form-item>
          <x-upload
            v-model:file-list="modelRef.attachments"
            :customRequest="customUpload"
            :accept="accept"
            :size="size"
            :maxCount="maxCount"></x-upload>
        </a-form-item>
      </a-form>
    </x-modal>
  </a-config-provider>
</template>
<script>
import { reactive, toRefs, defineComponent, watchEffect, watch } from 'vue'
import { Button, ConfigProvider, Form, FormItem, Space, Textarea } from 'ant-design-vue'
import zhCn from 'ant-design-vue/es/locale/zh_CN'
import { XModal, XTable, XUpload, XImage } from 'scm-ui-vue'
import { isFunction } from 'lodash-es'
import { formatTime, isEmpty, download, execRequest } from '@src/utils'
export default defineComponent({
  name: 'XRemark',
  components: {
    'x-modal': XModal,
    'x-table': XTable,
    'x-upload': XUpload,
    'x-image': XImage,
    'a-config-provider': ConfigProvider,
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
    rowKey: { type: [String, Function], default: 'id' },
    scrollY: { type: [String, Number], default: 360 },
    maxlength: { type: Number, default: 200 },
    visible: { type: Boolean, default: false },
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
  setup(props, { emit }) {
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
        { title: '附件', width: 120, dataIndex: 'attachments', ellipsis: true }
      ],
      dataSource: [],
      total: 0
    })

    const getAttachments = row => {
      return row?.files || row?.fileList || row?.images || row?.imageList || row?.resources || row?.attachments
    }
    const formatAttachments = attachments => {
      return isEmpty(attachments) ? [] : Array.isArray(attachments) ? attachments : [attachments]
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
                const attachments = getAttachments(row)
                const content = row?.remark || row?.content
                return {
                  ...row,
                  content,
                  attachments: formatAttachments(attachments)
                }
              })
              tableOptions.total = data?.total || 0
            } else {
              tableOptions.dataSource = (data || []).map(row => {
                const attachments = getAttachments(row)
                const content = row?.remark || row?.content
                return {
                  ...row,
                  content,
                  attachments: formatAttachments(attachments)
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

    const handleDownload = row => {
      const { url, fileName } = row || {}
      download(url, fileName)
    }

    const modelRef = reactive({
      content: '',
      attachments: []
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
          await execRequest(
            customSubmit({
              content: modelRef.content,
              ...(!isEmpty(modelRef.attachments) ? { ids: modelRef.attachments.map(val => val?.id) } : {})
            }),
            {
              success: ({ data }) => {
                emit('done', data)
                // TODO: 使用函数方法调用时，通过emit('update:visible', false)不生效，必须手动关闭。
                state.modalVisible = false // 只是为了兼容使用函数方法调用，才需要手动关闭
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
      emit('update:visible', false)
    }

    return {
      zhCn,
      ...toRefs(state),
      tableOptions,
      handleRequest,
      handleDownload,
      validateInfos,
      modelRef,
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