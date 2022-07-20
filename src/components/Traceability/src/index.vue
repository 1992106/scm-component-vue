<template>
  <div class="x-traceability">
    <Master :mode="masterMode" v-bind="masterProps">
      <template #materialHeaderCell="scope">
        <slot name="materialHeaderCell" v-bind="scope"></slot>
      </template>
      <template #materialBodyCell="scope">
        <slot name="materialBodyCell" v-bind="scope"></slot>
      </template>
      <template #photocopyHeaderCell="scope">
        <slot name="photocopyHeaderCell" v-bind="scope"></slot>
      </template>
      <template #photocopyBodyCell="scope">
        <slot name="photocopyBodyCell" v-bind="scope"></slot>
      </template>
    </Master>
    <a-row v-if="showWeaving || showDyeing" :gutter="20">
      <a-col :span="14">
        <Weaving :master="masterMode" :mode="weavingMode" v-bind="weavingProps">
          <template #weavingHeaderCell="scope">
            <slot name="weavingHeaderCell" v-bind="scope"></slot>
          </template>
          <template #weavingBodyCell="scope">
            <slot name="weavingBodyCell" v-bind="scope"></slot>
          </template>
        </Weaving>
      </a-col>
      <a-col :span="10">
        <Dyeing :master="masterMode" :mode="dyeingMode" v-bind="dyeingProps">
          <template #dyeingHeaderCell="scope">
            <slot name="dyeingHeaderCell" v-bind="scope"></slot>
          </template>
          <template #dyeingBodyCell="scope">
            <slot name="dyeingBodyCell" v-bind="scope"></slot>
          </template>
        </Dyeing>
      </a-col>
    </a-row>
  </div>
</template>
<script>
import { computed, defineComponent, inject, provide } from 'vue'
import Master from './Master.vue'
import Weaving from './Weaving.vue'
import Dyeing from './Dyeing.vue'
export default defineComponent({
  name: 'XTraceability',
  components: {
    Master,
    Weaving,
    Dyeing
  },
  props: {
    index: { type: Number, default: 0 },
    masterProps: Object,
    weavingProps: Object,
    dyeingProps: Object
  },
  setup(props) {
    const useMode = inject('mode')
    const useTraceabilityList = inject('traceabilityList')

    const traceabilityData = computed(() => useTraceabilityList[props.index] || {})

    provide('traceabilityData', traceabilityData)

    return {
      masterMode: useMode['master'],
      weavingMode: useMode['weaving'],
      showWeaving: computed(() => props.weavingProps?.visible !== false),
      dyeingMode: useMode['dyeing'],
      showDyeing: computed(() => props.weavingProps?.visible !== false)
    }
  }
})
</script>
<style lang="scss" scoped>
.x-traceability {
  .other-info {
    @include flex-row;

    justify-content: space-around;
    margin-top: 10px;

    :deep(.ant-form) {
      .ant-form-item {
        margin-bottom: 0;
      }
    }
  }

  :deep(.required) {
    color: red;
  }

  :deep(.title) {
    margin-bottom: 10px;

    .tips {
      color: #999;
    }
  }
}
</style>
