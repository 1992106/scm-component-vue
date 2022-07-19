import { defineComponent, h, reactive, ref } from 'vue'
import { useFullscreen } from '.'

export const UseFullscreen = defineComponent({
  name: 'UseFullscreen',
  props: ['as'],
  setup(props, { slots }) {
    const target = ref()
    const data = reactive(useFullscreen(target))

    return () => {
      if (slots.default) {
        return h(props.as || 'div', { ref: target }, slots.default(data))
      }
    }
  }
})
