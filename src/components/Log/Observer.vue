<template>
  <div ref="targetEl" class="observer" @click="handleClick">{{ statusText[status] || '' }}</div>
</template>
<script>
import { onMounted, onUnmounted, defineComponent, ref } from 'vue'
export default defineComponent({
  props: {
    status: {
      type: String,
      validator(value) {
        return ['', 'loading', 'finished', 'error'].includes(value)
      },
      required: true,
      default: ''
    },
    statusText: {
      type: Object,
      default: () => ({
        loading: '加载中...',
        finished: '—— 到底了 ——',
        error: '加载失败'
      })
    },
    rootMargin: {
      type: String,
      default: '0px 0px 30px 0px'
    }
  },
  emits: ['intersect', 'update:status'],
  setup(props, { emit }) {
    let observer = null
    const targetEl = ref(null)

    const handleClick = () => {
      if (props.status === 'error') {
        emit('update:status', 'loading')
        emit('intersect')
      }
    }

    onMounted(() => {
      // 构建观察器
      observer = new IntersectionObserver(
        ([entry]) => {
          if (['loading', 'finished', 'error'].includes(props.status)) {
            return
          }
          // 目标元素与根元素相交
          if (entry && entry.isIntersecting) {
            emit('update:status', 'loading')
            emit('intersect')
          }
        },
        { rootMargin: props.rootMargin }
      )

      // 观察目标元素
      observer.observe(targetEl.value)
    })

    // 组件销毁前停止监听
    onUnmounted(() => {
      observer.disconnect()
    })

    return {
      targetEl,
      handleClick
    }
  }
})
</script>
<style lang="less" scoped>
.observer {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ccc;
}
</style>
