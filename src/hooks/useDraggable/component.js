import { defineComponent, h, reactive, ref } from 'vue'
import { useDraggable } from '.'

export const UseDraggable = defineComponent({
  name: 'UseDraggable',
  props: ['exact', 'preventDefault', 'stopPropagation', 'pointerTypes', 'as'],
  setup(props, { slots }) {
    const target = ref()
    const initialValue = props.initialValue || { x: 0, y: 0 }

    const data = reactive(
      useDraggable(target, {
        ...props,
        initialValue
      })
    )

    return () => {
      if (slots.default) {
        return h(props.as || 'div', { ref: target, style: `touch-action:none;${data.style}` }, slots.default(data))
      }
    }
  }
})
