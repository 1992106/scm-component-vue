<template>
  <div class="master-info">
    <div class="title">主要信息</div>
    <x-table v-bind="materialOptions">
      <template #headerCell="{ title, column }">
        <slot name="materialHeaderCell" v-bind="{ title, column }">
          <div>
            <span v-if="column?.required === true" class="required">*</span>
            {{ title }}
          </div>
          <div v-if="column?.subTitle">{{ column.subTitle }}</div>
        </slot>
      </template>
      <template #bodyCell="{ text, record, index, column }">
        <slot
          name="materialBodyCell"
          v-bind="{ text, record, index, column }"
          :onUpdate="() => handleChange('material')">
          <template v-if="mode === 'view'">
            <template v-if="column?.dataIndex === 'materialSupplierCode'">
              <span>{{ record?.materialSupplierName || '--' }}</span>
            </template>
            <template v-if="column?.dataIndex === 'materialOriginPlace'">
              <span :title="record?.materialOriginPlace" v-html="record?.materialOriginPlaceHtml"></span>
            </template>
            <template v-if="column?.dataIndex === 'blankYarnOriginPlace'">
              <span :title="record?.blankYarnOriginPlace" v-html="record?.blankYarnOriginPlaceHtml"></span>
            </template>
          </template>
          <template v-else>
            <template v-if="column?.type === 'AInput'">
              <a-input
                v-model:value="record[column.dataIndex]"
                v-bind="column.props"
                @change="handleChange('material')"></a-input>
            </template>
            <template v-if="column?.type === 'AInputNumber'">
              <a-input-number
                v-model:value="record[column.dataIndex]"
                v-bind="column.props"
                @change="handleChange('material')"></a-input-number>
            </template>
            <template v-if="column?.type === 'ADatePicker'">
              <a-date-picker
                v-model:value="record[column.dataIndex]"
                v-bind="column.props"
                @change="handleChange('material')"></a-date-picker>
            </template>
          </template>
        </slot>
      </template>
    </x-table>
    <div class="title">
      <template v-if="mode === 'view'">原件复印件</template>
      <template v-else>
        请提供原件复印件
        <span class="tips">（支持扩展名： .png.jpg.jpeg.pdf 单文件大小：4M以下，单个类型文件最多20个）</span>
        <a-button type="link" :loading="loading" @click="handleDownloadPhotocopy">下载示例文件</a-button>
      </template>
    </div>
    <x-table v-bind="photocopyOptions">
      <template #headerCell="{ title, column }">
        <slot name="photocopyHeaderCell" v-bind="{ title, column }">
          <div>
            <span v-if="column?.required === true" class="required">*</span>
            {{ title }}
          </div>
        </slot>
      </template>
      <template #bodyCell="{ text, record, index, column }">
        <slot
          name="photocopyBodyCell"
          v-bind="{ text, record, index, column }"
          :onUpdate="() => handleChange('photocopy')">
          <x-upload
            v-model:file-list="record[column.dataIndex]"
            :custom-request="customUpload"
            :accept="accept"
            :mode="mode === 'view' ? 'preview' : 'upload'"
            :maxCount="maxCount"
            :showUploadList="{
              showPreviewIcon: true,
              showRemoveIcon: mode !== 'view',
              showDownloadIcon: true
            }"
            :before-upload="onBeforeImport"
            @change="handleChange('photocopy')" />
        </slot>
      </template>
    </x-table>
  </div>
</template>
<script>
import { defineComponent, inject, nextTick, reactive, toRefs, watch } from 'vue'
import { message } from 'ant-design-vue'
import { XTable, XUpload } from 'scm-ui-vue'
import { isFunction } from 'lodash-es'
import { dateToDayjs, download, execRequest } from '@src/utils'
export default defineComponent({
  name: 'Master',
  components: {
    'x-table': XTable,
    'x-upload': XUpload
  },
  props: {
    mode: { type: String, required: true },
    beforeUpload: { type: Function },
    accept: { type: String, default: '.png,.jpg,.jpeg,.pdf' },
    maxCount: { type: Number, default: 20 },
    customUpload: { type: Function },
    materialColumns: { type: Array },
    materialHighlight: {
      type: String,
      default:
        '新疆|维吾尔|天山区|新市区|米东区|水磨沟区|头屯河区|达坂城区|沙依巴克区|乌鲁木齐县|独山子区|白碱滩区|乌尔禾区|克拉玛依区|高昌区|鄯善县|托克逊县|伊州区|伊吾县|巴里坤哈萨克自治县|昌吉市|阜康市|奇台县|呼图壁县|玛纳斯县|吉木萨尔县|木垒哈萨克自治县|博乐市|阿拉山口市|精河县|温泉县|库尔勒市|轮台县|尉犁县|若羌县|且末县|和静县|和硕县|博湖县|焉耆回族自治县|阿克苏市|库车市|温宿县|沙雅县|新和县|拜城县|乌什县|柯坪县|阿瓦提县|阿图什市|乌恰县|阿克陶县|阿合奇县|喀什市|疏附县|疏勒县|泽普县|莎车县|叶城县|伽师县|巴楚县|英吉沙县|麦盖提县|岳普湖县|塔什库尔干塔吉克自治县|和田市|和田县|于田县|墨玉县|皮山县|洛浦县|策勒县|民丰县|伊宁市|奎屯市|霍尔果斯市|伊宁县|霍城县|巩留县|新源县|昭苏县|特克斯县|尼勒克县|察布查尔锡伯自治县|塔城市|乌苏市|沙湾市|额敏县|托里县|裕民县|和布克赛尔蒙古自治县|阿勒泰市县|青河县|布尔津县|哈巴河县|吉木乃县|石河子市|阿拉尔市|图木舒克市|五家渠市|北屯市|铁门关市|双河市|可克达拉市|昆玉市|胡杨河市|新星市'
    },
    photocopyColumns: { type: Array },
    customDownloadPhotocopy: { type: Function },
    emptyText: String
  },
  emits: ['del'],
  setup(props) {
    const state = reactive({
      loading: false
    })

    const traceabilityData = inject('traceabilityData')

    const defaultMaterialColumns = [
      { title: '物料名称', width: 160, dataIndex: 'materialName', ellipsis: true, type: 'AInput', required: true },
      {
        title: '面料供应商',
        width: 180,
        dataIndex: 'materialSupplierCode',
        ellipsis: true,
        type: 'ASelect',
        required: true
      },
      {
        title: '棉花供应商',
        width: 160,
        dataIndex: 'cottonSupplierName',
        ellipsis: true,
        type: 'AInput',
        required: true
      },
      {
        title: '材料原产地证明编号',
        width: 160,
        dataIndex: 'materialOriginCertificateNo',
        type: 'AInput',
        required: true
      },
      {
        title: '材料产地',
        subTitle: '（国家+地区.中文简体）',
        width: 160,
        dataIndex: 'materialOriginPlace',
        ellipsis: true,
        type: 'AInput',
        required: true
      },
      { title: '材料采购合同号', width: 160, dataIndex: 'purchaseContractNo', type: 'AInput', required: true },
      {
        title: '材料采购时间',
        width: 140,
        dataIndex: 'purchaseTime',
        type: 'ADatePicker',
        required: true,
        props: {
          valueFormat: 'YYYY-MM-DD'
        }
      },
      {
        title: '材料采购数量（KG）',
        width: 140,
        dataIndex: 'purchaseQuantity',
        type: 'AInputNumber',
        required: true,
        props: {
          precision: 2,
          min: 1,
          max: 10000000
        }
      },
      {
        title: '材料提货单号',
        subTitle: '（当坯纱产地=中国时选填）',
        width: 180,
        dataIndex: 'materialLadeBillNo',
        type: 'AInput'
      },
      { title: '坯纱采购合同号', width: 160, dataIndex: 'blankYarnPurchaseNo', type: 'AInput', required: true },
      {
        title: '坯纱产地',
        subTitle: '（国家+地区.中文简体）',
        width: 160,
        dataIndex: 'blankYarnOriginPlace',
        ellipsis: true,
        type: 'AInput',
        required: true
      },
      {
        title: '坯纱总采购总量（KG）',
        width: 160,
        dataIndex: 'blankYarnPurchaseQuantity',
        type: 'AInputNumber',
        required: true,
        props: {
          precision: 2,
          min: 1,
          max: 10000000
        }
      },
      { title: '坯纱采购发票号', width: 140, dataIndex: 'blankYarnInvoiceNo', type: 'AInput' },
      { title: '坯纱装箱单号', width: 140, dataIndex: 'blankYarnPackingNo', type: 'AInput' },
      { title: '坯纱提货单/物流单号', width: 200, dataIndex: 'logisticsNo', type: 'AInput' }
    ]
    const materialOptions = reactive({
      rowKey: 'uid',
      emptyText: props.emptyText,
      size: 'small',
      columns: props.materialColumns || defaultMaterialColumns,
      dataSource: [],
      showPagination: false
    })
    watch(
      () => traceabilityData.value.materialData,
      list => {
        const now = Date.now().toString()
        materialOptions.dataSource = (list || []).map((val, i) => ({
          ...val,
          ...(props.mode !== 'view' && val?.purchaseTime ? { purchaseTime: dateToDayjs(val?.purchaseTime) } : {}),
          ...(props.mode === 'view' && props.materialHighlight
            ? {
                ...(val?.materialOriginPlace
                  ? {
                      materialOriginPlaceHtml: val.materialOriginPlace.replace(
                        new RegExp(props.materialHighlight, 'ig'),
                        text => {
                          return `<span style="color:red">${text}</span>`
                        }
                      )
                    }
                  : {}),
                ...(val?.blankYarnOriginPlace
                  ? {
                      blankYarnOriginPlaceHtml: val.blankYarnOriginPlace.replace(
                        new RegExp(props.materialHighlight, 'ig'),
                        text => {
                          return `<span style="color:red">${text}</span>`
                        }
                      )
                    }
                  : {})
              }
            : {}),
          uid: val?.uid || now + i
        }))
      },
      { immediate: true }
    )
    const asyncMaterialData = () => {
      nextTick(() => {
        Object.assign(traceabilityData.value.materialData[0], materialOptions.dataSource[0])
      })
    }

    const defaultPhotocopyColumns = [
      { title: '1.棉花产地证明', width: '14%', dataIndex: 'certificateImgs', required: true },
      { title: '2.棉花采购合同/发票', width: '14%', dataIndex: 'contractImgs' },
      { title: '3.棉花提货单/装箱单', width: '14%', dataIndex: 'logisticsImgs' },
      { title: '4.坯纱采购合同', width: '14%', dataIndex: 'contractYarnImgs' },
      { title: '5.坯纱采购发票', width: '14%', dataIndex: 'logisticsYarnImgs' },
      { title: '6.坯纱送货单/装箱单/提货单', width: '14%', dataIndex: 'packingImgs' },
      { title: '7.委外加工合同', width: '14%', dataIndex: 'invoiceImgs' }
    ]
    const photocopyOptions = reactive({
      scroll: {
        y: 320
      },
      rowKey: 'uid',
      emptyText: props.emptyText,
      size: 'small',
      columns: props.photocopyColumns || defaultPhotocopyColumns,
      dataSource: [],
      showPagination: false
    })
    watch(
      () => traceabilityData.value.photocopyData,
      list => {
        const now = Date.now().toString()
        photocopyOptions.dataSource = (list || []).map((val, i) => ({ ...val, uid: val?.uid || now + i }))
      },
      { immediate: true }
    )

    const asyncPhotocopyData = () => {
      nextTick(() => {
        Object.assign(traceabilityData.value.photocopyData[0], photocopyOptions.dataSource[0])
      })
    }

    const handleChange = key => {
      if (key === 'material') {
        asyncMaterialData()
      } else if (key === 'photocopy') {
        asyncPhotocopyData()
      }
    }

    const onBeforeImport = file => {
      if (isFunction(props.beforeUpload)) {
        return props.beforeUpload(file)
      }

      const isExcel = ['image/png', 'image/jpg', 'image/jpeg', 'application/pdf'].includes(file.type)
      if (!isExcel) {
        message.error('文件格式只能是.png.jpg.jpeg.pdf！')
      }

      const isLt4M = file.size / 1024 / 1024 < 4
      if (!isLt4M) {
        message.error('文件不能大于4M！')
      }

      return isExcel && isLt4M
    }

    const handleDownloadPhotocopy = async () => {
      const { customDownloadPhotocopy } = props
      if (!isFunction(customDownloadPhotocopy)) return
      state.loading = true
      await execRequest(customDownloadPhotocopy(), {
        success: ({ data }) => {
          if (data) {
            download(data?.url, data?.name)
          }
        }
      })
      state.loading = false
    }

    return {
      ...toRefs(state),
      materialOptions,
      photocopyOptions,
      onBeforeImport,
      handleChange,
      handleDownloadPhotocopy
    }
  }
})
</script>
<style lang="scss" scoped>
.master-info {
  .x-table {
    margin-bottom: 16px;

    :deep(.x-upload) {
      .ant-upload-list-picture-card {
        min-height: 80px;
      }

      .ant-upload.ant-upload-select-picture-card,
      .ant-upload-list-picture-card-container {
        width: 80px;
        height: 80px;
      }

      .ant-upload-list-picture-card .ant-upload-list-item-info::before {
        left: 0;
      }
    }
  }
}
</style>
