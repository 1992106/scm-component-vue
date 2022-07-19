<template>
  <x-table v-bind="tableProps">
    <template #bodyCell="{ text, record, index, column }">
      <slot name="bodyCell" v-bind="{ text, record, index, column }" :onDelete="handleDel">
        <template v-if="column?.dataIndex === 'actions'">
          <a-button type="link" size="small" @click="handleDel(record)">删除</a-button>
        </template>
        <template v-if="column?.dataIndex === 'materialIngredient'">
          <template v-if="record?.materialIngredient && Array.isArray(record?.materialIngredient)">
            <a-tag v-for="item in record?.materialIngredient" :key="item?.zhName">
              {{ item?.zhName || '--' }}
            </a-tag>
          </template>
          <template v-else>--</template>
        </template>
      </slot>
    </template>
  </x-table>
</template>
<script lang="jsx">
import { defineComponent, reactive, watch } from 'vue'
import XTable from '@packages/components/Table/index.vue'

export default defineComponent({
  name: 'SelectedList',
  components: {
    'x-table': XTable
  },
  props: {
    rowKey: [String, Function],
    selectedColumns: { type: Array },
    selectedList: { type: Array, default: () => [] },
    emptyText: String
  },
  emits: ['del'],
  setup(props, { emit }) {
    const defaultColumns = [
      { title: '操作', width: 100, fixed: 'left', dataIndex: 'actions' },
      {
        title: '物料编码',
        width: 160,
        fixed: 'left',
        customRender: ({ record }) => {
          return (
            <>
              <div>{record?.materialSku || '--'}</div>
              <div>{record?.materialName || '--'}</div>
            </>
          )
        }
      },
      { title: '优选供应商', width: 160, dataIndex: 'supplierName' },
      { title: '颜色', width: 100, dataIndex: 'color' },
      {
        title: '物料分类',
        width: 200,
        customRender: ({ record }) => {
          return [record?.oneCategoryName, record?.twoCategoryName, record?.threeCategoryName].filter(Boolean).join('/')
        },
        ellipsis: true
      },
      { title: '单位', width: 60, dataIndex: 'unit' },
      { title: '大货价', width: 100, dataIndex: 'bigPrice' },
      {
        title: '供应商物料',
        width: 160,
        customRender: ({ record }) => {
          return (
            <>
              <div>{record?.supplierMaterialCode || '--'}</div>
              <div>{record?.supplierMaterialName || '--'}</div>
            </>
          )
        }
      },
      { title: '供应商物料颜色', width: 160, dataIndex: 'supplierMaterialColor' },
      { title: '供应商物料色号', width: 120, dataIndex: 'supplierMaterialColorNo' },
      { title: '物料成分', width: 180, dataIndex: 'materialIngredient', ellipsis: true }
    ]

    const tableProps = reactive({
      scroll: {
        y: 200
      },
      rowKey: props.rowKey,
      emptyText: props.emptyText,
      size: 'small',
      columns: props.selectedColumns || defaultColumns,
      dataSource: [],
      showPagination: false
    })

    watch(
      () => props.selectedList,
      list => {
        tableProps.dataSource = list
      },
      { deep: true, immediate: true }
    )

    const handleDel = row => {
      emit('del', row)
    }

    return {
      tableProps,
      handleDel
    }
  }
})
</script>
