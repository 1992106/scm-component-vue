<template>
  <x-modal
    v-bind="$attrs"
    v-model:visible="modalVisible"
    class="x-import__dialog"
    :title="title"
    :width="width"
    :spin-props="spinning"
    :confirm-loading="confirmLoading"
    destroy-on-close
    @ok="handleOk"
    @cancel="handleCancel">
    <div>
      一、请按照数据模式的格式准备导入数据，模版中的表头名称不可更改及删除。
      <span v-if="limit">每次限制导入 {{ limit }} 行。</span>
      <span v-if="extra" class="color-error">{{ extra }}</span>
      <br />
      <slot>
        <a-button type="link" :loading="downloadLoading" @click="handleDownload">下载模版</a-button>
      </slot>
    </div>
    <div style="margin-top: 20px">
      <p style="margin-bottom: 10px">二、将准备好的数据导入</p>
      <a-form :label-col="{ span: 0 }">
        <a-form-item v-bind="validateInfos['fileList']">
          <template v-if="customUpload">
            <x-upload
              v-model:file-list="modelRef.fileList"
              accept=".csv,.xls,.xlsx"
              list-type="text"
              :maxCount="1"
              :show-upload-list="{ showPreviewIcon: false, showRemoveIcon: true, showDownloadIcon: false }"
              :custom-request="customUpload">
              <a-button>
                <UploadOutlined />
                选择导入文件
              </a-button>
            </x-upload>
          </template>
          <template v-else>
            <a-upload
              :file-list="modelRef.fileList"
              accept=".csv,.xls,.xlsx"
              :before-upload="beforeUpload"
              @remove="handleRemove">
              <a-button>
                <UploadOutlined />
                选择导入的文件
              </a-button>
            </a-upload>
          </template>
        </a-form-item>
        <a-form-item v-if="showInput" v-bind="validateInfos['name']">
          <a-input v-model:value="modelRef.name" placeholder="请输入名称" />
        </a-form-item>
        <a-form-item v-if="showTextarea" v-bind="validateInfos['content']">
          <a-textarea
            v-model:value="modelRef.content"
            placeholder="请输入备注"
            :show-count="true"
            :rows="4"
            :maxlength="maxlength" />
        </a-form-item>
      </a-form>
    </div>
  </x-modal>
</template>
<script>
import { defineComponent, reactive, toRefs, watchEffect } from 'vue'
import { Button, Form, FormItem, Input, message, Modal, Textarea, Upload } from 'ant-design-vue'
import { UploadOutlined } from '@ant-design/icons-vue'
import { XModal, XUpload } from 'scm-ui-vue'
import { importFile } from './import'
import { isFunction } from 'lodash-es'
import { download, execRequest, isEmpty } from '@src/utils'
export default defineComponent({
  name: 'XImport',
  components: {
    UploadOutlined,
    'x-modal': XModal,
    'x-upload': XUpload,
    'a-upload': Upload,
    'a-form': Form,
    'a-form-item': FormItem,
    'a-input': Input,
    'a-textarea': Textarea,
    'a-button': Button,
    // eslint-disable-next-line vue/no-unused-components
    Modal
  },
  inheritAttrs: false,
  props: {
    title: { type: String, default: '导入数据' },
    width: { type: Number, default: 520 },
    visible: { type: Boolean, default: false },
    customImport: { type: Function }, // 【后端导入】：1、直接把文件传给后端解析；2、先上传文件到s3，再把key传给后端
    customUpload: { type: Function },
    customDownload: { type: Function },
    limit: { type: Number, default: 500 },
    extra: { type: String },
    showInput: { type: Boolean, default: false },
    inputRequired: { type: Boolean, default: false },
    showTextarea: { type: Boolean, default: false },
    textareaRequired: { type: Boolean, default: false },
    maxlength: { type: Number, default: 200 }
  },
  emits: ['update:visible', 'success'],
  setup(props, { emit, expose }) {
    const state = reactive({
      modalVisible: props.visible,
      spinning: false,
      downloadLoading: false,
      confirmLoading: false
    })

    watchEffect(() => {
      // 使用函数方法调用时不会触发
      state.modalVisible = props.visible
    })

    // 下载模板
    const handleDownload = async () => {
      const { customDownload } = props
      if (!isFunction(customDownload)) return
      state.downloadLoading = true
      message.info('正在下载中...')
      await execRequest(customDownload(), {
        success: ({ data }) => {
          if (data) {
            download(data?.url, data?.fileName)
          }
        }
      })
      state.downloadLoading = false
    }

    const beforeUpload = async file => {
      modelRef.fileList = [file]
      return false
    }

    const handleRemove = () => {
      modelRef.fileList = []
    }

    const modelRef = reactive({
      fileList: [],
      name: '',
      content: ''
    })

    const rulesRef = reactive({
      fileList: [{ required: true, type: 'array', message: '请上传文件' }],
      ...(props.showInput ? { name: [{ required: props.inputRequired, message: '请输入名称' }] } : {}),
      ...(props.showTextarea ? { content: [{ required: props.textareaRequired, message: '请输入备注' }] } : {})
    })

    const { resetFields, validate, validateInfos } = Form.useForm(modelRef, rulesRef)

    // 后端导入
    const handleImport = async () => {
      const { customUpload, customImport, showInput, showTextarea } = props
      if (!isFunction(customImport)) return
      const { name, content, fileList } = modelRef
      state.confirmLoading = true
      if (customUpload) {
        // 先上传文件到s3，再把key传给后端
        const file = fileList.filter(val => val?.status === 'done')[0]
        await execRequest(
          customImport({
            ...(!isEmpty(file) ? { id: file?.uid, file } : {}),
            ...(showInput ? { name } : {}),
            ...(showTextarea ? { content } : {})
          }),
          {
            success: ({ data }) => {
              emit('success', data)
              handleCancel()
            }
          }
        )
      } else {
        // 直接把文件传给后端解析
        const file = fileList[0]
        await importFile(
          customImport,
          {
            ...(file ? { file } : {}),
            ...(showInput ? { name } : {}),
            ...(showTextarea ? { content } : {})
          },
          data => {
            emit('success', data)
            handleCancel()
          }
        )
      }
      state.confirmLoading = false
    }

    const handleOk = async () => {
      validate()
        .then(() => {
          handleImport()
        })
        .catch(err => {
          console.error('import error', err)
        })
    }

    const handleCancel = () => {
      resetFields()
      emit('update:visible', false)
    }

    expose({})

    return {
      ...toRefs(state),
      beforeUpload,
      handleRemove,
      modelRef,
      validateInfos,
      handleDownload,
      handleOk,
      handleCancel
    }
  }
})
</script>
