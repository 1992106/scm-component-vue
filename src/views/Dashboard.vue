<template>
  <div>
    <a-space>
      <a-button @click="handlePreview">预览图片</a-button>
      <a-button @click="handleDownloads">下载中心</a-button>
    </a-space>
    <Preview v-model:visible="previewState.visible" :current="previewState.current" :urls="previewState.urls"></Preview>
  </div>
</template>
<script lang="ts">
import { defineComponent, onActivated, onMounted, onUnmounted, reactive } from 'vue'
import { useStore } from 'vuex'
import Preview from '@packages/components/Preview/index.vue'
export default defineComponent({
  name: 'Dashboard',
  components: { Preview },
  setup() {
    const store = useStore()
    // 预览图片
    const previewState = reactive({
      visible: false,
      current: 2,
      urls: [
        'https://gw.alipayobjects.com/zos/antfincdn/LlvErxo8H9/photo-1503185912284-5271ff81b9a8.webp',
        'https://gw.alipayobjects.com/zos/antfincdn/cV16ZqzMjW/photo-1473091540282-9b846e7965e3.webp',
        'https://gw.alipayobjects.com/zos/antfincdn/x43I27A55%26/photo-1438109491414-7198515b166b.webp'
      ]
    })
    const handlePreview = () => {
      previewState.visible = !previewState.visible
    }
    // 下载中心
    const handleDownloads = () => {
      store.commit('user/setVisible', true)
    }

    onMounted(() => {
      console.log('onMounted', 'Dashboard组件')
    })
    onActivated(() => {
      console.log('onActivated', 'Dashboard组件')
    })
    onUnmounted(() => {
      console.log('onUnmounted', 'Dashboard组件')
    })
    return {
      previewState,
      handlePreview,
      handleDownloads
    }
  }
})
</script>
<style lang="scss" scoped></style>
