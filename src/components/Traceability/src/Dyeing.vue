<template>
  <div class="dyeing-info">
    <a-form v-if="!showTable">
      <a-form-item label="请导入染整明细" name="file">
        <a-upload
          :showUploadList="false"
          :before-upload="beforeImport"
          :disabled="disabled"
          :custom-request="handleImportDyeing">
          <a-button>
            <UploadOutlined></UploadOutlined>
            上传
          </a-button>
        </a-upload>
        <template #extra>
          <div>
            支持扩展名：xlx,xlsx；文件大小：4M以下
            <a-button type="link" :loading="loading" @click="handleDownloadDyeing">查看模板</a-button>
          </div>
        </template>
      </a-form-item>
    </a-form>
    <template v-else>
      <div class="title">
        染整信息
        <template v-if="mode !== 'view'">
          <a-button type="link" :loading="loading" @click="handleDownloadDyeing">查看模板</a-button>
          <a-upload
            :showUploadList="false"
            :before-upload="beforeImport"
            :disabled="disabled"
            :custom-request="handleImportDyeing">
            <a-button type="link">继续导入</a-button>
          </a-upload>
        </template>
      </div>
      <x-table v-bind="tableOptions" v-model:pagination="tableOptions.pagination">
        <template #headerCell="{ title, column }">
          <slot name="dyeingHeaderCell" v-bind="{ title, column }">
            <div>
              <span v-if="column?.required === true" class="required">*</span>
              {{ title }}
            </div>
            <div v-if="column?.subTitle">{{ column.subTitle }}</div>
          </slot>
        </template>
        <template #bodyCell="{ text, record, index, column }">
          <slot
            name="dyeingBodyCell"
            v-bind="{ text, record, index, column }"
            :onDelete="handleDel"
            :onUpdate="() => handleChange(record)">
            <template
              v-if="
                mode !== 'view' &&
                (master !== 'view'
                  ? true
                  : record?.itemId == null
                  ? true
                  : ['colorClothWeight', 'colorClothLength'].includes(column.dataIndex))
              ">
              <!--导入明细时：色布/色纱重量(KG)和'色布米数(M)允许编辑-->
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
  name: 'Dyeing',
  components: {
    'x-table': XTable,
    UploadOutlined
  },
  props: {
    mode: { type: String, required: true },
    master: { type: String, required: true },
    dyeingRowKey: [String, Function],
    dyeingColumns: Array,
    beforeImportDyeing: Function,
    limitDyeing: Number,
    customImportDyeing: Function,
    customDownloadDyeing: Function,
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
      { title: '染整缸号', width: 120, dataIndex: 'dyeVatNo', fixed: 'left', type: 'AInput', required: true },
      {
        title: '色布/色纱重量(KG)',
        subTitle: '针织必填/梭织不能填',
        width: 160,
        dataIndex: 'colorClothWeight',
        type: 'AInputNumber',
        props: {
          precision: 2,
          min: 1,
          max: 10000000
        }
      },
      {
        title: '色布米数(M)',
        subTitle: '针织不能填/梭织必填',
        width: 160,
        dataIndex: 'colorClothLength',
        type: 'AInputNumber',
        props: {
          precision: 2,
          min: 1,
          max: 10000000
        }
      },
      { title: '染整颜色', width: 120, dataIndex: 'color', type: 'AInput' },
      { title: '染厂', width: 120, dataIndex: 'dyeFactory', type: 'AInput' },
      { title: '操作', width: 60, dataIndex: 'actions', fixed: 'right' }
    ]
    const tableOptions = reactive({
      rowKey: props.dyeingRowKey,
      emptyText: props.emptyText,
      size: 'small',
      columns: (props.dyeingColumns || defaultColumns).map(column => ({
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
      () => traceabilityData.value.dyeingData,
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
        Object.assign(traceabilityData.value.dyeingData[index], tableOptions.dataSource[index])
      })
    }

    const beforeImport = file => {
      if (isFunction(props.beforeImportDyeing)) {
        return props.beforeImportDyeing(file)
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
      if (!isEmpty(props.limitDyeing) && tableOptions.total >= props.limitDyeing) {
        message.error(`最多只能添加${props.limitDyeing}条！`)
        return true
      }
    }

    const handleImportDyeing = async ({ file }) => {
      const { customImportDyeing } = props
      if (!isFunction(customImportDyeing)) return
      if (importLimit()) return
      state.disabled = true
      await execRequest(customImportDyeing(file), {
        success: ({ data }) => {
          if (Array.isArray(data) && data.length) {
            const now = Date.now().toString()
            const newList = data.map((item, index) => {
              return {
                uid: now + index,
                dyeVatNo: item?.dyeVatNo,
                colorClothWeight: item?.colorClothWeight || null,
                colorClothLength: item?.colorClothLength || null,
                color: item?.color,
                dyeFactory: item?.dyeFactory
              }
            })
            const oldList = traceabilityData.value.dyeingData
            traceabilityData.value.dyeingData = [...newList, ...oldList]
            tableOptions.total = tableOptions.total + data.length
          }
        }
      })
      state.disabled = false
    }

    const handleDownloadDyeing = async () => {
      const { customDownloadDyeing } = props
      if (!isFunction(customDownloadDyeing)) return
      state.loading = true
      await execRequest(customDownloadDyeing(), {
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
      traceabilityData.value.dyeingData.splice(index, 1)
      tableOptions.total = tableOptions.total - 1
    }

    const handleAdd = () => {
      if (importLimit()) return
      const oldList = traceabilityData.value.dyeingData
      traceabilityData.value.dyeingData = [
        {
          uid: Date.now().toString(),
          dyeVatNo: '',
          colorClothWeight: null,
          colorClothLength: null,
          color: '',
          dyeFactory: ''
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
      handleImportDyeing,
      handleDownloadDyeing,
      handleDel,
      handleAdd
    }
  }
})
</script>
