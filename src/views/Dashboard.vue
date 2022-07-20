<template>
  <div>Dashboard</div>
</template>
<script lang="ts">
import { defineComponent, onActivated, onMounted, onUnmounted } from 'vue'
export default defineComponent({
  name: 'Dashboard',
  components: {},
  setup() {
    onMounted(() => {
      console.log('onMounted', 'Dashboard组件')
    })
    onActivated(() => {
      console.log('onActivated', 'Dashboard组件')
    })
    onUnmounted(() => {
      console.log('onUnmounted', 'Dashboard组件')
    })
    return {}
  }
})
</script>
<style lang="scss" scoped></style>
