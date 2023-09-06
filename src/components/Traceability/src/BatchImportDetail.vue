<template>
  <x-drawer
    v-bind="$attrs"
    v-model:visible="modalVisible"
    class="x-traceability__dialog"
    :title="title"
    :width="width"
    :height="height"
    :spinProps="spinning"
    :confirmLoading="confirmLoading"
    destroyOnClose
    @ok="handleOk"
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
        weavingColumns,
        beforeImportWeaving,
        limitWeaving,
        customImportWeaving,
        customDownloadWeaving
      }"
      :dyeingProps="{
        dyeingRowKey,
        dyeingColumns,
        beforeImportDyeing,
        limitDyeing,
        customImportDyeing,
        customDownloadDyeing
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
  name: 'XBatchImportDetail',
  components: {
    'x-drawer': XDrawer,
    XTraceability
  },
  inheritAttrs: false,
  props: {
    visible: { type: Boolean, default: false },
    title: { type: String, default: '导入明细' },
    width: { type: [String, Number], default: 'calc(100% - 240px)' },
    height: { type: [String, Number] },
    manual: { type: Boolean, default: false },
    customRequest: { type: Function, require: true },
    emptyText: { type: String, default: '暂无数据' },
    confirmLoading: { type: Boolean, default: false },
    // 主表
    materialColumns: { type: Array },
    materialHighlight: { type: String },
    photocopyColumns: { type: Array },
    // 织布
    weavingRowKey: { type: [String, Function], default: 'uid' },
    weavingColumns: { type: Array },
    beforeImportWeaving: { type: Function },
    limitWeaving: { type: Number, default: 9999 },
    customImportWeaving: { type: Function },
    customDownloadWeaving: { type: Function },
    // 染整
    dyeingRowKey: { type: [String, Function], default: 'uid' },
    dyeingColumns: { type: Array },
    beforeImportDyeing: { type: Function },
    limitDyeing: { type: Number, default: 9999 },
    customImportDyeing: { type: Function },
    customDownloadDyeing: { type: Function }
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

    const handleOk = () => {
      emit('done', state.traceabilityList[0])
    }

    const handleCancel = () => {
      state.traceabilityList = []
    }

    provide('mode', { master: 'view', weaving: 'action', dyeing: 'action' })
    provide('traceabilityList', state.traceabilityList)

    return {
      ...toRefs(state),
      modalVisible,
      getDetail,
      handleOk,
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
