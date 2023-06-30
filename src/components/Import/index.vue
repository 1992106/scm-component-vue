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
        <a-form-item v-if="showInput">
          <a-input v-model:value="modelRef.name" placeholder="清输入名称" />
        </a-form-item>
        <a-form-item v-bind="validateInfos['fileList']">
          <template v-if="customImport">
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
          <template v-else>
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
        </a-form-item>
        <a-form-item v-if="showTextarea">
          <a-textarea
            v-model:value="modelRef.content"
            placeholder="清输入备注"
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
    customImport: { type: Function }, // 直接把文件传给后端解析
    customSubmit: { type: Function }, // 先上传文件到s3，再把key传给后端
    customUpload: { type: Function },
    customDownload: { type: Function },
    limit: { type: Number, default: 500 },
    extra: { type: String },
    showInput: { type: Boolean, default: false },
    showTextarea: { type: Boolean, default: false },
    maxlength: { type: Number, default: 200 }
  },
  emits: ['update:visible', 'done'],
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
      fileList: [{ required: true, type: 'array', message: '请上传文件' }]
    })

    const { resetFields, validate, validateInfos } = Form.useForm(modelRef, rulesRef)

    const handleImport = async () => {
      const { customImport, showInput, showTextarea } = props
      if (!isFunction(customImport)) return
      const { name, content, fileList } = modelRef
      await importFile(
        customImport,
        { file: fileList[0], ...(showInput ? { name } : {}), ...(showTextarea ? { content } : {}) },
        data => {
          emit('done', data)
          // TODO: 使用函数方法调用时，通过emit('update:visible', false)不生效，必须手动关闭
          state.modalVisible = false // 只是为了兼容使用函数方法调用，才需要手动关闭
          handleCancel()
        }
      )
    }

    const handleSubmit = async () => {
      const { customSubmit, showInput, showTextarea } = props
      if (!isFunction(customSubmit)) return
      const { name, content, fileList } = modelRef
      const files = fileList.filter(val => val.status === 'done')
      await execRequest(
        customSubmit({
          ...(!isEmpty(files) ? { id: files?.[0]?.uid } : {}),
          ...(showInput ? { name } : {}),
          ...(showTextarea ? { content } : {})
        }),
        {
          success: ({ data }) => {
            emit('done', data)
            // TODO: 使用函数方法调用时，通过emit('update:visible', false)不生效，必须手动关闭
            state.modalVisible = false // 只是为了兼容使用函数方法调用，才需要手动关闭
            handleCancel()
          }
        }
      )
    }

    const handleOk = async () => {
      validate()
        .then(async () => {
          state.confirmLoading = true
          if (props.customImport) {
            await handleImport()
          } else if (props.customSubmit) {
            await handleSubmit()
          }
          state.confirmLoading = false
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
