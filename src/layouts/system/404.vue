<template>
  <div class="error-page">
    <Result status="404" title="404" sub-title="Sorry, the page you visited does not exist.">
      <template #extra>
        <Button type="primary" @click="backToHome">返回首页</Button>
      </template>
    </Result>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import { useRouter } from 'vue-router'
import { Result, Button } from 'ant-design-vue'

export default defineComponent({
  name: '404',
  components: { Result, Button },
  setup() {
    const router = useRouter()

    const backToHome = () => {
      router.push('/')
    }

    return {
      backToHome
    }
  }
})
</script>
<style lang="scss" scoped>
.error-page {
  height: 100vh;
  @include flexCCC;
}
</style>
