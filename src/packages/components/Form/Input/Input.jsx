import { defineComponent } from 'vue'
import { Input } from 'ant-design-vue'

// TODO: 支持逗号搜索+去除空格+excel
const XInput = defineComponent({
  name: 'XInput',
  inheritAttrs: false,
  props: {},
  emits: ['update:value', 'change', 'pressEnter', 'clear'],
  setup(props, ctx) {
    const handleChange = $event => {
      ctx.emit('change', $event)
    }

    return () => <Input {...ctx.attrs} change={handleChange} />
  }
})

export default XInput
