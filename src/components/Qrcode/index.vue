<template>
  <div ref="elQrcode"></div>
</template>
<script>
import { defineComponent, nextTick, ref, watch } from 'vue'
import JsQrcode from 'qrcodejs2-fix'
export default defineComponent({
  name: 'XQrcode',
  inheritAttrs: false,
  props: {
    code: { type: [String, Number], require: true },
    width: { type: Number, default: 120 },
    height: { type: Number, default: 120 },
    correctLevel: { type: String, default: 'L' },
    colorDark: { type: String, default: '#000' },
    colorLight: { type: String, default: '#fff' }
  },
  setup(props) {
    const elQrcode = ref(null)

    const generateQrcode = () => {
      // 生成二维码先清空旧的
      if (elQrcode.value) {
        elQrcode.value.innerHTML = ''
      }
      new JsQrcode(elQrcode.value, {
        text: props.code,
        width: props.width,
        height: props.height,
        colorDark: props.colorDark,
        colorLight: props.colorLight,
        correctLevel: JsQrcode?.CorrectLevel[props.correctLevel]
      })
    }

    watch(
      () => props.code,
      text => {
        if (text) {
          nextTick(generateQrcode)
        }
      },
      {
        immediate: true
      }
    )

    return {
      elQrcode,
      generateQrcode
    }
  }
})
</script>
