<template>
  <div class="x-print">
    <template v-if="showButton">
      <a-button type="default" v-bind="buttonProps" @click="handlePrint">
        {{ buttonText }}
        <template #icon>
          <slot name="icon"></slot>
        </template>
      </a-button>
    </template>
    <div style="display: none">
      <div ref="elPrint" class="x-print__content">
        <x-qrcode v-if="qrcodeProps" v-bind="qrcodeProps"></x-qrcode>
        <x-barcode v-if="barcodeProps" v-bind="barcodeProps"></x-barcode>
        <div class="x-print__content-box">
          <slot :data="result"></slot>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { defineComponent, ref } from 'vue'
import { message } from 'ant-design-vue'
import XQrcode from '../Qrcode/index.vue'
import XBarcode from '../Barcode/index.vue'
import print from './print'
import { isFunction } from 'lodash-es'
import { execRequest } from '@src/utils'
export default defineComponent({
  name: 'XPrint',
  components: {
    'x-qrcode': XQrcode,
    'x-barcode': XBarcode
  },
  inheritAttrs: false,
  props: {
    // 打印按钮
    showButton: { type: Boolean, default: true },
    buttonText: { type: String, default: '打印' },
    buttonProps: { type: Object },
    // 二维码
    qrcodeProps: { type: Object },
    // 条形码
    barcodeProps: { type: Object },
    // 打印标题
    title: { type: String, default: '' },
    // 延迟时间
    delay: { type: Number, default: 2000 },
    // 打印前的回调
    onBefore: { type: Function, default: null }
  },
  emits: ['done'],
  setup(props, { emit, expose }) {
    const elPrint = ref(null)
    const result = ref(null)

    const handlePrint = async () => {
      const { onBefore } = props
      if (onBefore) {
        // 有onBefore时
        if (!isFunction(onBefore)) return
        const hideMessage = message.loading('正在加载，请稍等...', 0)
        await execRequest(onBefore(), {
          success: ({ data }) => {
            result.value = data
            printf()
          }
        })
        hideMessage()
      } else {
        // 没有onBefore时，直接打印
        printf()
      }
    }

    const handleDone = () => {
      emit('done')
    }

    const printf = () => {
      setTimeout(() => {
        print({
          el: elPrint.value,
          title: props.title,
          delay: props.delay,
          callback: handleDone
        })
      }, 200)
    }

    // 提供外部使用
    const onPrint = () => {
      handlePrint()
    }

    expose({
      onPrint
    })

    return {
      elPrint,
      result,
      handlePrint
    }
  }
})
</script>
<style lang="scss" scoped>
.x-print__content {
  display: flex;

  & > div:first-of-type:not(.x-print__content-box) {
    margin-right: 10px;
  }

  &-box {
    display: flex;
    flex-direction: column;
    flex: 1;
  }
}
</style>
