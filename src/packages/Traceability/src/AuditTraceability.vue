<template>
  <x-drawer
    v-bind="$attrs"
    v-model:visible="modalVisible"
    class="x-traceability__dialog"
    :title="title"
    :width="width"
    :height="height"
    :spinProps="spinning"
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
        weavingColumns,
        visible: false
      }"
      :dyeingProps="{
        dyeingRowKey,
        dyeingColumns,
        visible: false
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
    <template #footer>
      <a-space>
        <a-button @click="handleCancel">取消</a-button>
        <a-button type="primary" :loading="failLoading" danger @click="handleOk(0)">不通过</a-button>
        <a-button type="primary" :loading="passLoading" @click="handleOk(1)">通过</a-button>
      </a-space>
    </template>
  </x-drawer>
</template>
<script>
import { computed, defineComponent, provide, reactive, toRefs, watch } from 'vue'
import XDrawer from '@packages/components/Drawer'
import XTraceability from './index.vue'
import { isFunction } from 'lodash-es'
import { execRequest } from '@src/utils'
export default defineComponent({
  name: 'XAuditTraceability',
  components: {
    'x-drawer': XDrawer,
    XTraceability
  },
  inheritAttrs: false,
  props: {
    visible: { type: Boolean, default: false },
    title: { type: String, default: '审核溯源包' },
    width: { type: [String, Number], default: 'calc(100% - 240px)' },
    height: { type: [String, Number] },
    manual: { type: Boolean, default: false },
    customRequest: { type: Function, require: true },
    emptyText: { type: String, default: '暂无数据' },
    failLoading: { type: Boolean, default: false },
    passLoading: { type: Boolean, default: false },
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
      disabled: false,
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
      modalVisible.value = false
    }

    const handleOk = type => {
      emit('done', { isPass: type, data: state.traceabilityList[0] })
    }

    provide('mode', { master: 'view', weaving: 'view', dyeing: 'view' })
    provide('traceabilityList', state.traceabilityList)

    return {
      ...toRefs(state),
      modalVisible,
      getDetail,
      handleCancel,
      handleOk
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
