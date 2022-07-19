<template>
  <img ref="elBarcode" alt="条形码" />
  <p v-if="displayValue" style="text-align: center; font-size: 20px; margin-top: -6px; color: #000">
    {{ text || code }}
  </p>
</template>

<script>
import { nextTick, watch, ref, defineComponent } from 'vue'
import JsBarcode from 'jsbarcode'

export default defineComponent({
  name: 'XBarcode',
  inheritAttrs: false,
  props: {
    code: { type: String, require: true },
    format: { type: String, default: 'CODE128' }, // 条形码类型
    width: { type: Number, default: 2 }, // 条之间的宽度
    height: { type: Number, default: 40 }, // 高度
    text: { type: String }, // 显示的文字，默认显示code
    lineColor: { type: String, default: '#000' },
    displayValue: { type: Boolean, default: true } // 是否显示条形码下面的文字
  },
  setup(props) {
    const elBarcode = ref(null)
    const getBarCode = () => {
      JsBarcode(elBarcode.value, props.code, {
        width: props.width,
        height: props.height,
        format: props.format,
        lineColor: props.lineColor,
        displayValue: false
      })
    }
    watch(
      () => props.code,
      code => {
        if (code) {
          nextTick(getBarCode)
        }
      },
      {
        immediate: true
      }
    )
    return {
      elBarcode,
      getBarCode
    }
  }
})
</script>
