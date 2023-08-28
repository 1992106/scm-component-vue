<template>
  <div class="x-export">
    <template v-if="showButton">
      <a-button type="default" v-bind="buttonProps" @click="handleExport">
        {{ buttonText }}
        <template #icon>
          <slot name="icon"></slot>
        </template>
      </a-button>
    </template>
    <div ref="elExport" class="x-export__content">
      <slot :data="result"></slot>
    </div>
  </div>
</template>
<script>
import { defineComponent, ref } from 'vue'
import { message } from 'ant-design-vue'
import { isFunction } from 'lodash-es'
import { jsPDF } from './htmlToPdf'
import { execRequest, isEmpty } from '@src/utils'
export default defineComponent({
  name: 'XExport',
  inheritAttrs: false,
  props: {
    // 导出按钮
    showButton: { type: Boolean, default: true },
    buttonText: { type: String, default: '导出' },
    buttonProps: { type: Object },
    mode: {
      validator(value) {
        return ['download', 'print'].includes(value)
      },
      default: 'download'
    },
    // 导出文件类型
    fileType: {
      validator(value) {
        // 支持pdf和word导出
        return ['pdf', 'word'].includes(value)
      },
      default: 'pdf'
    },
    // 导出文件名
    fileName: { type: String },
    // 方向【横向:l/纵向:p】
    direction: { type: String, default: 'l' },
    // 单位
    unit: { type: String, default: 'pt' },
    // 尺寸
    size: { type: Array },
    // 延迟时间
    delay: { type: Number, default: 1000 },
    // 导出前的回调
    onBefore: { type: Function }
  },
  emits: ['done'],
  setup(props, { emit, expose }) {
    const elExport = ref(null)
    const result = ref(null)

    const handleExport = () => {
      const { onBefore } = props
      if (onBefore) {
        // 有onBefore时
        if (!isFunction(onBefore)) return
        execRequest(onBefore(), {
          success: ({ data }) => {
            result.value = data
            if (isEmpty(data)) {
              message.info('打印内容为空！')
              return
            }
            dispatch()
          }
        })
      } else {
        // 没有onBefore时，直接打印
        dispatch()
      }
    }

    const dispatch = () => {
      switch (props.fileType) {
        case 'pdf':
          exportPDF()
          break
        case 'word':
          exportWord()
          break
      }
    }

    const handleDone = event => {
      emit('done', event)
    }

    // 导出PDF
    const exportPDF = () => {
      setTimeout(() => {
        jsPDF({
          el: elExport.value,
          fileName: props.fileName,
          direction: props.direction,
          unit: props.unit,
          size: props.size,
          mode: props.mode,
          callback: handleDone
        })
      }, props.delay)
    }

    // 导出word
    const exportWord = () => {
      // TODO: 待实现
    }

    // 提供外部调用
    const onExport = () => {
      handleExport()
    }

    expose({
      onExport
    })

    return {
      elExport,
      result,
      handleExport
    }
  }
})
</script>
<style lang="scss" scoped>
.x-export {
  &__content {
    position: fixed;
    width: 100%;
    top: -9999px;
    left: 9999px;
    background-color: #fff;
    z-index: -9999;
  }
}
</style>
