import { computed, defineComponent, PropType, ref, toRefs, unref, watchEffect } from 'vue'
import { Modal, Spin } from 'ant-design-vue'
import { CloseOutlined, FullscreenExitOutlined, FullscreenOutlined } from '@ant-design/icons-vue'
import { useModalDragMove } from './useModalDrag'
import './index.scss'

type SpinProps = {
  prefixCls?: string
  spinning?: boolean
  size?: 'default' | 'small' | 'large'
  wrapperClassName?: string
  tip?: string
  delay?: number
  indicator?: any
}

const ModalProps = {
  visible: Boolean,
  destroyOnClose: Boolean,
  wrapClassName: String,
  class: String
}

const XModal = defineComponent({
  name: 'XModal',
  inheritAttrs: false,
  props: {
    ...ModalProps,
    draggable: { type: Boolean, default: true },
    showFullscreen: { type: Boolean, default: true },
    fullscreen: { type: Boolean, default: false },
    manual: { type: Boolean, default: false },
    spinProps: { type: [Boolean, Object] as PropType<boolean | SpinProps>, default: false }
  },
  emits: ['update:visible', 'cancel', 'ok', 'fullScreen'],
  setup(props, ctx) {
    // 加载
    const spinProps = computed(() => {
      return typeof props.spinProps === 'object' ? props.spinProps : { spinning: props.spinProps }
    })

    // 拖拽
    const { visible, draggable, destroyOnClose } = toRefs(props)
    useModalDragMove({
      visible,
      destroyOnClose,
      draggable
    })

    // 全屏
    const canFullscreen = ref(false)
    watchEffect(() => {
      canFullscreen.value = props.fullscreen
    })

    const handleFullscreen = (e: Event) => {
      e?.stopPropagation()
      e?.preventDefault()
      canFullscreen.value = !unref(canFullscreen)
      ctx.emit('fullScreen', canFullscreen.value)
    }

    const renderIcon = () => {
      return props.showFullscreen ? (
        <div class='x-modal__fullscreen-actions'>
          {props.fullscreen ? (
            <FullscreenExitOutlined onClick={handleFullscreen} />
          ) : (
            <FullscreenOutlined onClick={handleFullscreen} />
          )}
          <CloseOutlined />
        </div>
      ) : (
        <CloseOutlined />
      )
    }

    const wrapClassName = computed(() =>
      [props.wrapClassName, `${unref(canFullscreen) ? 'x-modal__fullscreen' : ''}`].filter(Boolean).join(' ')
    )

    const handleCancel = () => {
      if (!props.manual) {
        ctx.emit('update:visible', false)
      }
      ctx.emit('cancel')
    }

    const handleOk = () => {
      ctx.emit('ok')
    }

    return () => (
      <Modal
        {...props}
        {...ctx.attrs}
        wrapClassName={unref(wrapClassName)}
        class={['x-modal', `${props.showFullscreen ? 'is-fullscreen' : ''}`, props?.class]}
        closeIcon={renderIcon()}
        title={ctx.slots?.title?.() || ctx.attrs?.title}
        footer={ctx.slots?.footer?.() || ctx.attrs?.footer}
        onCancel={handleCancel}
        onOk={handleOk}>
        <Spin {...unref(spinProps)}>{ctx.slots?.default && ctx.slots?.default()}</Spin>
      </Modal>
    )
  }
})

export default XModal
