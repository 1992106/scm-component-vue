<template>
  <ConfigProvider :locale="language">
    <RouterView />
  </ConfigProvider>
</template>

<script>
import { defineComponent } from 'vue'
import { ConfigProvider } from 'ant-design-vue'
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import '@src/styles/index.scss'

dayjs.locale('zh')

export default defineComponent({
  components: {
    ConfigProvider
  },
  setup() {
    const language = zhCN

    return { language }
  }
})
</script>

<style lang="scss">
#app {
  color: #2c3e50;
}
</style>
