import { defineComponent, unref, computed, PropType } from 'vue'
import { createFromIconfontCN } from '@ant-design/icons-vue'
import setting from '@src/config'

const IconFont = defineComponent({
  name: 'IconFont',
  props: {
    type: { type: String as PropType<string>, default: '' },
    color: { type: String as PropType<string>, default: 'unset' },
    size: { type: [Number, String] as PropType<number | string>, default: 14 },
    scriptUrl: { type: String as PropType<string>, default: setting.iconfont_url }
  },
  setup(props, { attrs }) {
    const MyIconFont = createFromIconfontCN({
      scriptUrl: props.scriptUrl
    })

    const wrapStyleRef = computed(() => {
      const { color, size } = props

      const fs = parseFloat(size as string)

      return {
        color,
        fontSize: `${fs}px`
      }
    })

    return () => <MyIconFont type={props.type || ' '} {...attrs} style={unref(wrapStyleRef)} />
  }
})

export default IconFont
