<template>
  <div ref="target" class="observer">{{ statusText[status] }}</div>
</template>
<script>
import { ref, onMounted, onBeforeUnmount, defineComponent } from 'vue'
export default defineComponent({
  props: {
    status: {
      type: String,
      validator(value) {
        return ['done', 'error', 'loading', 'end'].includes(value)
      },
      required: true,
      default: ''
    },
    statusText: {
      type: Object,
      default: () => ({
        done: '',
        error: '加载失败',
        loading: '加载中...',
        end: '—— 到底了 ——'
      })
    },
    options: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['intersect'],
  setup(props, { emit }) {
    let observer = null
    const target = ref(null)
    onMounted(() => {
      // 构建观察器
      observer = new IntersectionObserver(([entry]) => {
        // 目标元素与根元素相交
        if (entry && entry.isIntersecting && props.status !== 'end') {
          emit('intersect')
        }
      }, props.options)

      // 观察目标元素
      observer.observe(target.value)
    })

    // 组件销毁前停止监听
    onBeforeUnmount(() => {
      observer.disconnect()
    })

    return {
      target
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
