<template>
  <Breadcrumb :routes="allRoutes" separator=">">
    <template #itemRender="{ route, routes, paths }">
      <span v-if="allRoutes.indexOf(route) === routes.length - 1">
        {{ route.meta.title }}
      </span>
      <router-link v-else :to="handlePath(route, paths)">
        {{ route.meta.title }}
      </router-link>
    </template>
  </Breadcrumb>
</template>
<script>
import { defineComponent, ref, watch } from 'vue'
import { Breadcrumb } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import { whiteRoutes } from '@src/router'

export default defineComponent({
  name: 'MyBreadcrumb',
  components: { Breadcrumb },
  setup() {
    const router = useRouter()
    const allRoutes = ref([])

    const handlePath = (route, paths) => {
      return route.children ? route.redirect || `/${paths.slice(-1)}` : `/${paths.slice(-2).join('/')}`
    }

    watch(
      () => router.currentRoute.value.fullPath,
      () => {
        if (whiteRoutes.includes(router.currentRoute.value.name)) return
        allRoutes.value = router.currentRoute.value.matched.filter(item => item.path !== '/')
      },
      { immediate: true }
    )

    return {
      handlePath,
      allRoutes
    }
  }
})
</script>
