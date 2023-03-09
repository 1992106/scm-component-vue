<template>
  <router-view v-slot="{ Component, route }">
    <transition mode="out-in" name="fade-slide" appear>
      <keep-alive :include="cachedRoutes">
        <component :is="Component" :key="route.fullPath" />
      </keep-alive>
    </transition>
  </router-view>
</template>

<script>
import { defineComponent, computed } from 'vue'
import { useStore } from 'vuex'

export default defineComponent({
  name: 'AppMain',
  setup() {
    const store = useStore()
    const cachedRoutes = computed(() => {
      return store.getters['router/cachedRoutes'].map(item => item.name)
    })

    return {
      cachedRoutes
    }
  }
})
</script>
