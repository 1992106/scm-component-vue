<template>
  <x-drawer
    v-bind="$attrs"
    v-model:visible="modalVisible"
    class="x-traceability__dialog"
    :title="title"
    :width="width"
    :height="height"
    :spinProps="spinning"
    manual
    destroyOnClose
    @cancel="handleCancel">
    <a-form>
      <a-form-item label="请导入主表" :required="true">
        <a-upload
          :showUploadList="false"
          :before-upload="beforeImport"
          :disabled="disabled"
          :custom-request="handleImportMaterial">
          <a-button>
            <UploadOutlined></UploadOutlined>
            上传
          </a-button>
        </a-upload>
        <template #extra>
          <div>
            支持扩展名：xlx,xlsx；文件大小：4M以下
            <a-button type="link" :loading="loading" @click="handleDownloadMaterial">查看模板</a-button>
          </div>
        </template>
      </a-form-item>
    </a-form>
    <a-collapse v-model:activeKey="activeKey" expandIconPosition="right">
      <a-collapse-panel v-for="(_, index) in traceabilityList" :key="index">
        <template #header>
          <a-space>
            {{ `溯源包${index + 1}` }}
            <a-button type="link" @click="handleDelete($event, index)">删除</a-button>
          </a-space>
        </template>
        <XTraceability
          :index="index"
          :emptyText="emptyText"
          :masterProps="{
            materialColumns,
            photocopyColumns,
            beforeUpload,
            accept,
            maxCount,
            customUpload,
            customDownloadPhotocopy
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
      </a-collapse-panel>
    </a-collapse>
    <template #footer>
      <a-space>
        <a-button @click="handleCancel">取消</a-button>
        <a-button type="primary" danger :loading="saveLoading" @click="handleOk(1)">保存</a-button>
        <a-button type="primary" :loading="submitLoading" @click="handleOk(2)">保存并提交</a-button>
      </a-space>
    </template>
  </x-drawer>
</template>
<script>
import { computed, createVNode, defineComponent, provide, reactive, toRefs } from 'vue'
import { ExclamationCircleOutlined, UploadOutlined } from '@ant-design/icons-vue'
import { message, Modal } from 'ant-design-vue'
import XDrawer from '@packages/components/Drawer'
import XTraceability from './index.vue'
import { isFunction } from 'lodash-es'
import { download, execRequest, isEmpty } from '@src/utils'
export default defineComponent({
  name: 'XBatchImportTraceability',
  components: {
    'x-drawer': XDrawer,
    UploadOutlined,
    XTraceability
  },
  inheritAttrs: false,
  props: {
    visible: { type: Boolean, default: false },
    title: { type: String, default: '批量导入' },
    width: { type: [String, Number], default: 'calc(100% - 240px)' },
    height: { type: [String, Number] },
    manual: { type: Boolean, default: false },
    emptyText: { type: String, default: '暂无数据' },
    saveLoading: { type: Boolean, default: false },
    submitLoading: { type: Boolean, default: false },
    // 主表
    beforeImportMaterial: { type: Function },
    limitMaterial: { type: Number, default: 20 },
    customImportMaterial: { type: Function, require: true },
    customDownloadMaterial: { type: Function },
    materialColumns: { type: Array },
    beforeUpload: { type: Function },
    accept: { type: String },
    maxCount: { type: Number },
    customUpload: { type: Function },
    customDownloadPhotocopy: { type: Function },
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
      loading: false,
      disabled: false,
      activeKey: [],
      traceabilityList: []
    })

    const beforeImport = file => {
      if (isFunction(props.beforeImportMaterial)) {
        return props.beforeImportMaterial(file)
      }

      const isExcel =
        file.type === 'application/vnd.ms-excel' ||
        file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      if (!isExcel) {
        message.error('文件格式只能是xlx,xlsx！')
      }

      const isLt4M = file.size / 1024 / 1024 < 4
      if (!isLt4M) {
        message.error('文件不能大于4M！')
      }

      return isExcel && isLt4M
    }

    const importLimit = () => {
      if (!isEmpty(props.limitMaterial) && state.traceabilityList.length >= props.limitMaterial) {
        message.error(`最多只能导入${props.limitMaterial}条！`)
        return true
      }
    }

    const handleImportMaterial = async ({ file }) => {
      const { customImportMaterial } = props
      if (!isFunction(customImportMaterial)) return
      if (importLimit()) return
      state.disabled = true
      await execRequest(customImportMaterial(file), {
        success: ({ data }) => {
          // 根据【'坯纱采购合同号'】，如果有重复，则更新，如果没有则新增
          const blankYarnPurchaseNos = state.traceabilityList?.flatMap(val =>
            (val?.materialData || []).map(val => val?.blankYarnPurchaseNo)
          )
          const oldList = (data || []).filter(val => blankYarnPurchaseNos.includes(val?.blankYarnPurchaseNo))
          const newList = (data || []).filter(val => !blankYarnPurchaseNos.includes(val?.blankYarnPurchaseNo))
          // 更新数据
          if (oldList.length) {
            state.traceabilityList.forEach(item => {
              item.materialData = item.materialData.map(item => {
                const tempObj = oldList.find(val => val?.blankYarnPurchaseNo === item?.blankYarnPurchaseNo) || {}
                return {
                  ...item,
                  ...tempObj
                }
              })
            })
          }
          // 插入数据
          if (newList.length) {
            newList.forEach(item => {
              state.traceabilityList.unshift({
                materialData: [item],
                photocopyData: [
                  {
                    certificateImgs: [],
                    contractImgs: [],
                    logisticsImgs: [],
                    contractYarnImgs: [],
                    logisticsYarnImgs: [],
                    packingImgs: [],
                    invoiceImgs: []
                  }
                ],
                weavingData: [],
                dyeingData: []
              })
            })
          }
          state.activeKey = state.traceabilityList.map((_, i) => i)
        }
      })
      state.disabled = false
    }

    const handleDownloadMaterial = async () => {
      const { customDownloadMaterial } = props
      if (!isFunction(customDownloadMaterial)) return
      state.loading = true
      await execRequest(customDownloadMaterial(), {
        success: ({ data }) => {
          if (data) {
            download(data?.url, data?.fileName)
          }
        }
      })
      state.loading = false
    }

    const handleDelete = (event, index) => {
      event.stopPropagation()
      state.traceabilityList.splice(index, 1)
      state.activeKey.pop()
    }

    const handleOk = action => {
      emit('done', { action, data: state.traceabilityList })
    }

    const handleCancel = () => {
      Modal.confirm({
        title: '当前页面信息未保存，是否离开？',
        icon: createVNode(ExclamationCircleOutlined),
        okText: '离开',
        cancelText: '取消',
        okButtonProps: {
          type: 'primary',
          danger: true
        },
        onOk() {
          state.traceabilityList = []
          modalVisible.value = false
        }
      })
    }

    provide('mode', { master: 'action', weaving: 'action', dyeing: 'action' })
    provide('traceabilityList', state.traceabilityList)

    return {
      ...toRefs(state),
      modalVisible,
      beforeImport,
      handleImportMaterial,
      handleDownloadMaterial,
      handleDelete,
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
