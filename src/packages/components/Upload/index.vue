<template>
  <a-upload
    v-bind="$attrs"
    v-model:file-list="files"
    class="x-upload"
    :list-type="listType"
    :show-upload-list="showUploadList"
    :accept="accept"
    :max-count="maxCount"
    :before-upload="onBeforeUpload"
    :custom-request="handleCustomRequest"
    @change="handleChange"
    @preview="handlePreview"
    @download="handleDownload">
    <div v-if="mode === 'upload' && (!maxCount || files.length < maxCount)">
      <slot>
        <PlusOutlined />
      </slot>
      <span v-show="maxCount" class="max-count">({{ files.length }}/{{ maxCount }})</span>
    </div>
    <template v-if="hasItemRender" #itemRender="scope">
      <slot name="itemRender" v-bind="scope"></slot>
    </template>
  </a-upload>
  <x-preview v-model:visible="previewVisible" :current="previewCurrent" :urls="previewUrls"></x-preview>
</template>
<script>
import { computed, defineComponent, reactive, toRefs, watch } from 'vue'
import { Form, message, Upload } from 'ant-design-vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import XPreview from '../Preview/index.vue'
import { isFunction } from 'lodash-es'
import { isEmpty, downloadByUrl, execRequest } from '@src/utils'
export default defineComponent({
  name: 'XUpload',
  components: {
    PlusOutlined,
    'x-preview': XPreview,
    'a-upload': Upload
  },
  inheritAttrs: false,
  props: {
    fileList: { type: Array, default: () => [], required: true },
    customRequest: { type: Function },
    listType: { type: String, default: 'picture-card' },
    showUploadList: { type: [Boolean, Object], default: true },
    beforeUpload: { type: Function },
    mode: {
      validator(value) {
        return ['upload', 'preview'].includes(value)
      },
      default: 'upload'
    },
    accept: { type: String }, // 'image/*'、'application/*'、'audio/*'、'video/*'
    size: { type: Number },
    maxCount: { type: Number }
  },
  emits: ['update:file-list', 'change', 'preview', 'download'],
  setup(props, { emit, slots }) {
    const state = reactive({
      files: [],
      // 预览图片
      previewVisible: false,
      previewUrls: [],
      previewCurrent: 0
    })

    // 上传前校验
    const onBeforeUpload = file => {
      if (props.beforeUpload && isFunction(props.beforeUpload)) {
        return props.beforeUpload(file)
      }
      // 格式
      let isAccept = true
      if (!isEmpty(props.accept)) {
        const accepts = props.accept.split(',')
        if (props.accept.includes('image/')) {
          isAccept = accepts.some(val => file.type.endsWith(val)) || file.type.startsWith('image/')
        }
        if (props.accept.includes('application/')) {
          isAccept = accepts.some(val => file.type.endsWith(val)) || file.type.startsWith('application/')
        }
        if (props.accept.includes('audio/')) {
          isAccept = accepts.some(val => file.type.endsWith(val)) || file.type.startsWith('audio/')
        }
        if (props.accept.includes('video/')) {
          isAccept = accepts.some(val => file.type.endsWith(val)) || file.type.startsWith('video/')
        }
      }
      if (!isAccept) {
        message.error(`只能上传${props.accept}格式`)
      }
      // 大小
      let isLtM = true
      if (!isEmpty(props.size)) {
        isLtM = file.size / 1024 / 1024 < props.size
      }
      if (!isLtM) {
        message.error(`不能大于${props.size}M`)
      }
      return isLtM && isAccept
    }

    watch(
      () => props.fileList,
      fileList => {
        state.files = (fileList || []).map(val => {
          return {
            ...val,
            ...(val?.id || val?.key
              ? {
                  uid: val?.id || val?.key,
                  name: val?.fileName || val?.name,
                  status: 'done',
                  thumbUrl: val?.url || val?.thumbUrl,
                  url: val?.url
                }
              : {})
          }
        })
      },
      { immediate: true, deep: true }
    )

    // 自定义校验
    const formItemContext = Form.useInjectFormItemContext()
    // 上传图片
    const handleCustomRequest = async option => {
      const { customRequest } = props
      if (!isFunction(customRequest)) return
      const { file } = option
      await execRequest(customRequest(file), {
        success: ({ data }) => {
          // 上传成功（status: 'done'）
          // 没有触发option.onSuccess()，手动设置状态为 'done'
          const uploadFile = {
            ...data,
            uid: data?.id || data?.key,
            name: data?.fileName || data?.name,
            status: 'done',
            thumbUrl: data?.url || data?.thumbUrl,
            url: data?.url
          }
          const index = state.files.findIndex(val => val?.uid === file?.uid)
          state.files.splice(index, 1, uploadFile)
          emit('update:file-list', state.files)
          emit('change', { file: uploadFile, fileList: state.files })
          // 自定义表单组件需要手动调用onFieldChange触发校验
          formItemContext.onFieldChange()
        },
        fail: () => {
          // 上传失败（status: 'error'）
          // 没有触发option.onError()，手动设置状态为 'error'
          const uploadFile = state.files.find(val => val?.uid === file?.uid)
          uploadFile.status = 'error'
          // 手动删除上传失败的图片
          setTimeout(() => {
            state.files = state.files.filter(val => val?.status === 'done')
          }, 200)
        }
      })
      // try {
      //   const { data } = await customRequest(file)
      //   // 上传成功（status: 'done'）
      //   // 没有触发option.onSuccess()，手动设置状态为 'done'
      //   const uploadFile = {
      //     ...data,
      //     uid: data?.id || data?.key,
      //     name: data?.fileName || data?.name,
      //     status: 'done',
      //     thumbUrl: data?.url || data?.thumbUrl,
      //     url: data?.url
      //   }
      //   const index = state.files.findIndex(val => val?.uid === file?.uid)
      //   state.files.splice(index, 1, uploadFile)
      //   emit('update:file-list', state.files)
      //   emit('change', { file: uploadFile, fileList: state.files })
      // } catch (e) {
      //   // 上传失败（status: 'error'）
      //   // 没有触发option.onError()，手动设置状态为 'error'
      //   const uploadFile = state.files.find(val => val?.uid === file?.uid)
      //   uploadFile.status = 'error'
      //   // 手动删除上传失败的图片
      //   setTimeout(() => {
      //     state.files = state.files.filter(val => val?.status === 'done')
      //   }, 500)
      // }
    }

    // 上传文件改变时的状态（'uploading' 'done' 'error' 'removed'）
    // 因为自定义customRequest方法没有调用onSuccess和onError方法，所以不会触发状态为 'done' 和 'error' 的 change事件
    const handleChange = data => {
      const { file, fileList } = data
      // 移除
      if (file.status === 'removed') {
        state.files = fileList.filter(val => val.status === 'done')
        emit('update:file-list', state.files)
        emit('change', { file, fileList })
        // 自定义表单组件需要手动调用onFieldChange触发校验
        formItemContext.onFieldChange()
      } else if (file.status === undefined) {
        // onBeforeUpload限制上传的图片status为undefined；故需要过滤限制上传的图片
        // multiple为true时，多文件上传，需要异步延迟处理
        setTimeout(() => {
          state.files = fileList.filter(val => val?.status !== undefined)
        }, 20)
      }
    }

    // 预览图片
    const handlePreview = file => {
      if (
        props.listType === 'text' &&
        (props.showUploadList === false || props.showUploadList?.showPreviewIcon === false)
      ) {
        return false
      }
      const list = state.files.filter(val => val.status === 'done')
      state.previewUrls = list.map(val => val?.url)
      state.previewCurrent = list.findIndex(v => v.id === file.id)
      state.previewVisible = true
      emit('preview', file)
    }

    // 下载
    const handleDownload = file => {
      message.info('正在下载中...')
      downloadByUrl(file.url, file.name)
      emit('download', file)
    }

    //
    const hasItemRender = computed(() => !!slots['itemRender'])

    return {
      ...toRefs(state),
      hasItemRender,
      onBeforeUpload,
      handleCustomRequest,
      handleChange,
      handlePreview,
      handleDownload
    }
  }
})
</script>
<style lang="scss" scoped>
.x-upload {
  :deep(.ant-upload) {
    position: relative;

    .max-count {
      position: absolute;
      bottom: 0;
      right: 0;
      transform: translateX(100%);
      padding-left: 5px;
      color: $color-primary;
      user-select: none;
    }
  }

  :deep(.ant-upload-list-picture-card) {
    min-height: 112px;
  }

  :deep(.ant-upload-select-text) .ant-upload {
    display: inline-block;
  }
}
</style>
