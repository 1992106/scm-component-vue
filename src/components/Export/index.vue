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
import { isFunction } from 'lodash-es'
import jsPDF from './jsPDF'
import { execRequest } from '@src/utils'
export default defineComponent({
  name: 'XExport',
  inheritAttrs: false,
  props: {
    // 导出按钮
    showButton: { type: Boolean, default: true },
    buttonText: { type: String, default: '导出' },
    buttonProps: { type: Object },
    // 导出文件类型
    fileType: { type: String, default: 'pdf' }, // 支持pdf和excel导出
    // 导出文件名
    fileName: { type: String, default: '' },
    // 延迟时间
    delay: { type: Number, default: 200 },
    // 导出前的回调
    onBefore: { type: Function }
  },
  emits: ['done'],
  setup(props, { emit }) {
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
            dispatch()
          }
        })
      } else {
        // 没有onBefore时，直接打印
        dispatch()
      }
    }

    const handleDone = () => {
      emit('done')
    }

    const dispatch = () => {
      switch (props.fileType) {
        case 'pdf':
          exportPDF()
          break
        case 'excel':
          exportExcel()
          break
        default:
          exportPDF()
      }
    }

    // 导出PDF
    const exportPDF = () => {
      setTimeout(() => {
        jsPDF({
          el: elExport.value,
          fileName: props.fileName,
          handleDone
        })
      }, props.delay)
    }

    // 导出excel
    const exportExcel = () => {
      // TODO: 待实现
    }

    // 提供外部调用
    const onExport = () => {
      handleExport()
    }

    return {
      elExport,
      result,
      handleExport,
      onExport
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
