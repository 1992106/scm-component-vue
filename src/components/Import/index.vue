<template>
  <x-modal
    v-bind="$attrs"
    v-model:visible="modalVisible"
    class="x-import__dialog"
    :title="title"
    :width="width"
    :spin-props="spinning"
    :confirm-loading="confirmLoading"
    :ok-button-props="{ disabled: hasUploading }"
    :footer="customImport ? null : undefined"
    destroy-on-close
    @ok="handleOk"
    @cancel="handleCancel">
    <div>
      一、请按照数据模式的格式准备导入数据，模版中的表头名称不可更改及删除，每次限制导入
      {{ limit }}
      行。
      <span v-if="extra" class="color-error">{{ extra }}</span>
      <br />
      <slot>
        <a-button type="link" :loading="downloadLoading" @click="handleDownload">下载模版</a-button>
      </slot>
    </div>
    <div style="margin-top: 20px">
      <p style="margin-bottom: 10px">二、将准备好的数据导入</p>
      <x-upload
        v-model:fileList="files"
        class="import-template"
        accept=".csv,.xls,.xlsx"
        :maxCount="1"
        :list-type="listType"
        :show-upload-list="showUploadList"
        :custom-request="customRequest">
        <template v-if="customImport">
          <UploadOutlined />
          选择导入文件
        </template>
        <a-button v-else>
          <UploadOutlined />
          选择导入文件
        </a-button>
      </x-upload>
    </div>
  </x-modal>
</template>
<script>
import { computed, defineComponent, reactive, toRefs, watchEffect } from 'vue'
import { Button, Modal } from 'ant-design-vue'
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
    'a-button': Button,
    // eslint-disable-next-line vue/no-unused-components
    Modal
  },
  inheritAttrs: false,
  props: {
    title: { type: String, default: '导入数据' },
    width: { type: Number, default: 520 },
    visible: { type: Boolean, default: false },
    customImport: { type: Function },
    customSubmit: { type: Function },
    customUpload: { type: Function },
    customDownload: { type: Function },
    limit: { type: Number, default: 500 },
    extra: { type: String }
  },
  emits: ['update:visible', 'done'],
  setup(props, { emit, expose }) {
    const state = reactive({
      modalVisible: props.visible,
      spinning: false,
      downloadLoading: false,
      confirmLoading: false,
      files: []
    })

    watchEffect(() => {
      // 使用函数方法调用时不会触发
      state.modalVisible = props.visible
    })

    const handleDownload = async () => {
      const { customDownload } = props
      if (!isFunction(customDownload)) return
      state.downloadLoading = true
      await execRequest(customDownload(), {
        success: ({ data }) => {
          if (data) {
            download(data?.url, data?.fileName)
          }
        }
      })
      state.downloadLoading = false
    }

    const listType = computed(() => (props.customImport ? 'picture-card' : 'text'))
    const showUploadList = computed(() => {
      return props.customImport ? false : { showPreviewIcon: false, showRemoveIcon: true, showDownloadIcon: true }
    })

    // 是否有上传中的文件
    const hasUploading = computed(() => {
      return props.customImport ? false : state.files.some(val => val.status === 'uploading')
    })
    const customRequest = async file => {
      const { customImport, customUpload } = props
      if (customImport) {
        state.files = [] // 清空文件列表
        return await handleImport(file).then(() => ({ data: {} }))
      } else if (customUpload) {
        return await customUpload(file)
      }
    }

    const handleImport = async file => {
      const { customImport } = props
      if (!isFunction(customImport)) return
      state.spinning = true
      await importFile(customImport, file, data => {
        emit('done', data)
        // TODO: 使用函数方法调用时，通过emit('update:visible', false)不生效，必须手动关闭
        state.modalVisible = false // 只是为了兼容使用函数方法调用，才需要手动关闭
        handleCancel()
      })
      state.spinning = false
    }

    const handleOk = async () => {
      const { customSubmit } = props
      if (!isFunction(customSubmit)) return
      state.confirmLoading = true
      await execRequest(
        customSubmit({
          ...(!isEmpty(state.files) ? { id: state.files?.[0]?.uid } : {})
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
      state.confirmLoading = false
    }

    const handleCancel = () => {
      emit('update:visible', false)
    }

    expose({})

    return {
      ...toRefs(state),
      listType,
      showUploadList,
      hasUploading,
      customRequest,
      handleImport,
      handleDownload,
      handleOk,
      handleCancel
    }
  }
})
</script>
<style lang="scss" scoped>
.x-import__dialog {
  :global(.import-template .ant-upload.ant-upload-select-picture-card) {
    width: 120px;
    height: 120px;
  }
}
</style>
