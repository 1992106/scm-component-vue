<template>
  <div class="weaving-info">
    <a-form v-if="!showTable">
      <a-form-item label="请导入织布明细" name="file">
        <a-upload
          :showUploadList="false"
          :before-upload="beforeImport"
          :disabled="disabled"
          :custom-request="handleImportWeaving">
          <a-button>
            <UploadOutlined></UploadOutlined>
            上传
          </a-button>
        </a-upload>
        <template #extra>
          <div>
            支持扩展名：xlx,xlsx；文件大小：4M以下
            <a-button type="link" :loading="loading" @click="handleDownloadWeaving">查看模板</a-button>
          </div>
        </template>
      </a-form-item>
    </a-form>
    <template v-else>
      <div class="title">
        织布信息
        <template v-if="mode !== 'view'">
          <a-button type="link" :loading="loading" @click="handleDownloadWeaving">查看模板</a-button>
          <a-upload
            :showUploadList="false"
            :before-upload="beforeImport"
            :disabled="disabled"
            :custom-request="handleImportWeaving">
            <a-button type="link">继续导入</a-button>
          </a-upload>
        </template>
      </div>
      <x-table v-bind="tableOptions" v-model:pagination="tableOptions.pagination">
        <template #headerCell="{ title, column }">
          <slot name="weavingHeaderCell" v-bind="{ title, column }">
            <div>
              <span v-if="column?.required === true" class="required">*</span>
              {{ title }}
            </div>
            <div v-if="column?.subTItle">{{ column.subTItle }}</div>
          </slot>
        </template>
        <template #bodyCell="{ text, record, index, column }">
          <slot
            name="weavingBodyCell"
            v-bind="{ text, record, index, column }"
            :onDelete="handleDel"
            :onUpdate="() => handleChange(record)">
            <template v-if="mode !== 'view' && (master === 'view' ? record?.itemId == null : true)">
              <template v-if="column?.type === 'AInput'">
                <a-input
                  v-model:value="record[column.dataIndex]"
                  v-bind="column.props"
                  @change="handleChange(record)"></a-input>
              </template>
              <template v-if="column?.type === 'AInputNumber'">
                <a-input-number
                  v-model:value="record[column.dataIndex]"
                  v-bind="column.props"
                  @change="handleChange(record)"></a-input-number>
              </template>
              <template v-if="column.dataIndex === 'actions'">
                <a-button type="link" size="small" @click="handleDel(record)">删除</a-button>
              </template>
            </template>
          </slot>
        </template>
        <template v-if="mode !== 'view'" #summary>
          <a-table-summary-row>
            <a-table-summary-cell :col-span="summaryLength" align="center">
              <a-button type="link" size="small" @click="handleAdd">添加一行</a-button>
            </a-table-summary-cell>
          </a-table-summary-row>
        </template>
      </x-table>
    </template>
  </div>
</template>
<script>
import { computed, defineComponent, inject, nextTick, reactive, toRefs, watch } from 'vue'
import { message } from 'ant-design-vue'
import { UploadOutlined } from '@ant-design/icons-vue'
import { XTable } from 'scm-ui-vue'
import { isFunction } from 'lodash-es'
import { download, execRequest, isEmpty } from '@src/utils'
export default defineComponent({
  name: 'Weaving',
  components: {
    'x-table': XTable,
    UploadOutlined
  },
  props: {
    mode: { type: String, required: true },
    master: { type: String, required: true },
    weavingRowKey: [String, Function],
    weavingColumns: Array,
    beforeImportWeaving: Function,
    limitWeaving: Number,
    customImportWeaving: Function,
    customDownloadWeaving: Function,
    emptyText: String
  },
  emits: ['del'],
  setup(props) {
    const state = reactive({
      loading: false,
      disabled: false,
      showTable: props.mode === 'view'
    })

    const traceabilityData = inject('traceabilityData')

    const defaultColumns = [
      { title: '坯布条编码', width: 120, dataIndex: 'greyClothNo', fixed: 'left', type: 'AInput', required: true },
      {
        title: '棉成分占比',
        subTitle: '(0到100)',
        width: 120,
        dataIndex: 'cottonComponentsRate',
        type: 'AInputNumber',
        props: {
          precision: 0,
          min: 1,
          max: 100
        }
      },
      { title: '织单号', width: 120, dataIndex: 'weavingOrderNo', type: 'AInput' },
      {
        title: '坯布重量(KG)',
        subTitle: '针织必填/梭织不能填',
        width: 160,
        dataIndex: 'greyClothWeight',
        type: 'AInputNumber',
        props: {
          precision: 2,
          min: 1,
          max: 10000000
        }
      },
      {
        title: '坯布米数(M)',
        subTitle: '针织不能填/梭织必填',
        width: 160,
        dataIndex: 'greyClothLength',
        type: 'AInputNumber',
        props: {
          precision: 2,
          min: 1,
          max: 10000000
        }
      },
      { title: '织厂', width: 120, dataIndex: 'textileMill', type: 'AInput' },
      { title: '操作', width: 60, dataIndex: 'actions', fixed: 'right' }
    ]
    const tableOptions = reactive({
      rowKey: props.weavingRowKey,
      emptyText: props.emptyText,
      size: 'small',
      columns: (props.weavingColumns || defaultColumns).map(column => ({
        ...column,
        visible: column?.dataIndex === 'actions' ? props.mode !== 'view' : true
      })),
      dataSource: [],
      total: 0,
      showPagination: true,
      pagination: {
        page: 1,
        pageSize: 20
      }
    })
    // 获取总结栏长度
    const summaryLength = computed(() => tableOptions.columns.filter(val => val?.visible !== false).length)

    watch(
      () => traceabilityData.value.weavingData,
      list => {
        const now = Date.now().toString()
        tableOptions.dataSource = (list || []).map((val, i) => ({ ...val, uid: val?.uid || now + i }))
        state.showTable = props.mode === 'view' ? true : list && list?.length > 0
      },
      { immediate: true }
    )

    const handleChange = row => {
      const index = tableOptions.dataSource.findIndex(val => val?.uid === row?.uid)
      nextTick(() => {
        Object.assign(traceabilityData.value.weavingData[index], tableOptions.dataSource[index])
      })
    }

    const beforeImport = file => {
      if (isFunction(props.beforeImportWeaving)) {
        return props.beforeImportWeaving(file)
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
      if (!isEmpty(props.limitWeaving) && tableOptions.total >= props.limitWeaving) {
        message.error(`最多只能添加${props.limitWeaving}条！`)
        return true
      }
    }

    const handleImportWeaving = async ({ file }) => {
      const { customImportWeaving } = props
      if (!isFunction(customImportWeaving)) return
      if (importLimit()) return
      state.disabled = true
      await execRequest(customImportWeaving(file), {
        success: ({ data }) => {
          if (Array.isArray(data) && data.length) {
            const now = Date.now().toString()
            const newList = data.map((item, index) => {
              return {
                uid: now + index,
                weavingOrderNo: item?.weavingOrderNo,
                greyClothNo: item?.greyClothNo,
                cottonComponentsRate: item?.cottonComponentsRate || 100,
                greyClothWeight: item?.greyClothWeight || null,
                greyClothLength: item?.greyClothLength || null,
                textileMill: item?.textileMill
              }
            })
            const oldList = traceabilityData.value.weavingData
            traceabilityData.value.weavingData = [...newList, ...oldList]
            tableOptions.total = tableOptions.total + data.length
          }
        }
      })
      state.disabled = false
    }

    const handleDownloadWeaving = async () => {
      const { customDownloadWeaving } = props
      if (!isFunction(customDownloadWeaving)) return
      state.loading = true
      await execRequest(customDownloadWeaving(), {
        success: ({ data }) => {
          if (data) {
            download(data?.url, data?.fileName)
          }
        }
      })
      state.loading = false
    }

    const handleDel = row => {
      const index = tableOptions.dataSource.findIndex(val => val?.uid === row?.uid)
      tableOptions.dataSource.splice(index, 1)
      traceabilityData.value.weavingData.splice(index, 1)
      tableOptions.total = tableOptions.total - 1
    }

    const handleAdd = () => {
      if (importLimit()) return
      const oldList = traceabilityData.value.weavingData
      traceabilityData.value.weavingData = [
        {
          uid: Date.now().toString(),
          weavingOrderNo: '',
          greyClothNo: '',
          cottonComponentsRate: 100,
          greyClothWeight: null,
          greyClothLength: null,
          textileMill: ''
        },
        ...oldList
      ]
      tableOptions.total += 1
    }

    return {
      ...toRefs(state),
      beforeImport,
      tableOptions,
      handleChange,
      summaryLength,
      handleImportWeaving,
      handleDownloadWeaving,
      handleDel,
      handleAdd
    }
  }
})
</script>
