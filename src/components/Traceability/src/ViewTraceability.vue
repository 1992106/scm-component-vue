<template>
  <x-drawer
    v-bind="$attrs"
    v-model:visible="modalVisible"
    class="x-traceability__dialog"
    :title="title"
    :width="width"
    :height="height"
    :spinProps="spinning"
    :footer="null"
    destroyOnClose
    @cancel="handleCancel">
    <XTraceability
      :index="0"
      :emptyText="emptyText"
      :masterProps="{
        materialColumns,
        materialHighlight,
        photocopyColumns
      }"
      :weavingProps="{
        weavingRowKey,
        weavingColumns
      }"
      :dyeingProps="{
        dyeingRowKey,
        dyeingColumns
      }">
      <!--主表-->
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
      <!--织布-->
      <template #weavingHeaderCell="scope">
        <slot name="weavingHeaderCell" v-bind="scope"></slot>
      </template>
      <template #weavingBodyCell="scope">
        <slot name="weavingBodyCell" v-bind="scope"></slot>
      </template>
      <!--染整-->
      <template #dyeingHeaderCell="scope">
        <slot name="dyeingHeaderCell" v-bind="scope"></slot>
      </template>
      <template #dyeingBodyCell="scope">
        <slot name="dyeingBodyCell" v-bind="scope"></slot>
      </template>
    </XTraceability>
  </x-drawer>
</template>
<script>
import { computed, defineComponent, provide, reactive, toRefs, watch } from 'vue'
import { XDrawer } from 'scm-ui-vue'
import XTraceability from './index.vue'
import { isFunction } from 'lodash-es'
import { execRequest } from '@src/utils'
export default defineComponent({
  name: 'XViewTraceability',
  components: {
    'x-drawer': XDrawer,
    XTraceability
  },
  inheritAttrs: false,
  props: {
    visible: { type: Boolean, default: false },
    title: { type: String, default: '查看溯源包' },
    width: { type: [String, Number], default: 'calc(100% - 240px)' },
    height: { type: [String, Number] },
    // rowKey: { type: [String, Function], default: 'id' },
    manual: { type: Boolean, default: false },
    customRequest: { type: Function, require: true },
    emptyText: { type: String, default: '暂无数据' },
    // 主表
    materialColumns: { type: Array },
    materialHighlight: { type: String },
    photocopyColumns: { type: Array },
    // 织布
    weavingRowKey: { type: [String, Function], default: 'uid' },
    weavingColumns: { type: Array },
    // 染整
    dyeingRowKey: { type: [String, Function], default: 'uid' },
    dyeingColumns: { type: Array }
  },
  emits: ['update:visible', 'done'],
  setup(props, { emit }) {
    const modalVisible = computed({
      get: () => {
        return props.visible
      },
      set: val => {
        emit('update:visible', val)
      }
    })

    const state = reactive({
      spinning: false,
      traceabilityList: []
    })

    const getDetail = async () => {
      const { customRequest } = props
      if (!isFunction(customRequest)) return
      state.spinning = true
      await execRequest(customRequest(), {
        success: ({ data }) => {
          state.traceabilityList.push({
            materialData: data?.traceabilityResp ? [data?.traceabilityResp] : [],
            photocopyData: [
              {
                certificateImgs: data?.certificateImgs || [],
                contractImgs: data?.contractImgs || [],
                logisticsImgs: data?.logisticsImgs || [],
                contractYarnImgs: data?.contractYarnImgs || [],
                logisticsYarnImgs: data?.logisticsYarnImgs || [],
                packingImgs: data?.packingImgs || [],
                invoiceImgs: data?.invoiceImgs || []
              }
            ],
            weavingData: data?.greyClothList || [],
            dyeingData: data?.dyeVatList || []
          })
        }
      })
      state.spinning = false
    }

    watch(
      () => props.visible,
      visible => {
        if (visible) {
          getDetail()
        }
      },
      { immediate: true }
    )

    const handleCancel = () => {
      state.traceabilityList = []
    }

    provide('mode', { master: 'view', weaving: 'view', dyeing: 'view' })
    provide('traceabilityList', state.traceabilityList)

    return {
      ...toRefs(state),
      modalVisible,
      getDetail,
      handleCancel
    }
  }
})
</script>
<style lang="scss">
.x-traceability__dialog {
  &.x-modal {
    top: 24px;
  }
}
</style>
