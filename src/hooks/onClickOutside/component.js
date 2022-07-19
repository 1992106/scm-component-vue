import { defineComponent, h, ref } from 'vue'
import { onClickOutside } from '.'

export const OnClickOutside = defineComponent({
  name: 'OnClickOutside',
  props: ['as'],
  emits: ['trigger'],
  setup(props, { slots, emit }) {
    const target = ref()
    onClickOutside(target, e => {
      emit('trigger', e)
    })

    return () => {
      if (slots.default) {
        return h(props.as || 'div', { ref: target }, slots.default())
      }
    }
  }
})
