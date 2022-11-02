<template>
  <x-modal
    v-bind="$attrs"
    v-model:visible="modalVisible"
    class="x-import__dialog"
    :title="title"
    :width="width"
    :spin-props="spinning"
    :footer="null"
    destroy-on-close
    @cancel="handleCancel">
    <div>
      一、请按照数据模式的格式准备导入数据，模版中的表头名称不可更改及删除，每次限制导入
      {{ limit }}
      行。
      <span v-if="extra" class="color-error">{{ extra }}</span>
      <br />
      <slot>
        <a-button type="link" :loading="loading" @click="handleDownload">下载模版</a-button>
      </slot>
    </div>
    <div style="margin-top: 20px">
      <p style="margin-bottom: 10px">二、将准备好的数据导入</p>
      <a-upload
        class="import-template"
        accept=".csv, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        list-type="picture-card"
        :show-upload-list="false"
        :custom-request="handleImport">
        <div>
          <UploadOutlined />
          <p>选择导入的文件</p>
        </div>
      </a-upload>
    </div>
  </x-modal>
</template>
<script>
import { defineComponent, reactive, toRefs, watchEffect } from 'vue'
import { Button, Modal, Upload } from 'ant-design-vue'
import { UploadOutlined } from '@ant-design/icons-vue'
import { XModal } from 'scm-ui-vue'
import { importFile } from './import'
import { isFunction } from 'lodash-es'
import { download, execRequest } from '@src/utils'
export default defineComponent({
  name: 'XImport',
  components: {
    UploadOutlined,
    'x-modal': XModal,
    'a-upload': Upload,
    'a-button': Button,
    // eslint-disable-next-line vue/no-unused-components
    Modal
  },
  inheritAttrs: false,
  props: {
    title: { type: String, default: '导入数据' },
    width: { type: Number, default: 520 },
    visible: { type: Boolean, default: false },
    customImport: { type: Function, required: true },
    customDownload: { type: Function },
    limit: { type: Number, default: 500 },
    extra: { type: String }
  },
  emits: ['update:visible', 'done'],
  setup(props, { emit, expose }) {
    const state = reactive({
      modalVisible: props.visible,
      spinning: false,
      loading: false
    })

    watchEffect(() => {
      // 使用函数方法调用时不会触发
      state.modalVisible = props.visible
    })

    const handleImport = async option => {
      const { customImport } = props
      if (!isFunction(customImport)) return
      state.spinning = true
      await importFile(customImport, option, data => {
        emit('done', data)
        // TODO: 使用函数方法调用时，通过emit('update:visible', false)不生效，必须手动关闭
        state.modalVisible = false // 只是为了兼容使用函数方法调用，才需要手动关闭
        handleCancel()
      })
      state.spinning = false
    }

    const handleDownload = async () => {
      const { customDownload } = props
      if (!isFunction(customDownload)) return
      state.loading = true
      await execRequest(customDownload(), {
        success: ({ data }) => {
          if (data) {
            download(data?.url, data?.fileName)
          }
        }
      })
      state.loading = false
    }

    const handleCancel = () => {
      emit('update:visible', false)
    }

    expose({})

    return {
      ...toRefs(state),
      handleImport,
      handleDownload,
      handleCancel
    }
  }
})
</script>
<style lang="scss" scoped>
.x-import__dialog {
  :deep(.import-template) {
    .ant-upload.ant-upload-select-picture-card {
      width: 120px;
      height: 120px;
    }
  }
}
</style>
