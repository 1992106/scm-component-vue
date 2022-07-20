<template>
  <x-table v-bind="tableProps" v-model:pagination="pages" v-model:selectedValue="selectedList" @select="handleSelect">
    <template #bodyCell="{ text, record, index, column }">
      <slot name="bodyCell" v-bind="{ text, record, index, column }">
        <template v-if="column?.dataIndex === 'thumbnail'">
          <x-image :width="60" :height="60" :thumbnail="record?.images?.[0]?.thumbUrl" :urls="record?.images"></x-image>
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
import { computed, defineComponent, reactive, watch } from 'vue'
import { XTable, XImage } from 'scm-ui-vue'

export default defineComponent({
  name: 'MaterialList',
  components: {
    'x-table': XTable,
    'x-image': XImage
  },
  props: {
    rowKey: [String, Function],
    selectedType: String,
    selectedValue: { type: Array, default: () => [] },
    materialColumns: { type: Array },
    materialList: { type: Array, default: () => [] },
    total: Number,
    pagination: Object,
    emptyText: String
  },
  emits: ['update:pagination', 'update:selectedValue', 'search', 'select'],
  setup(props, { emit }) {
    const defaultColumns = [
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
      { title: '图片', width: 100, fixed: 'left', dataIndex: 'thumbnail' },
      { title: '物料状态', width: 100, dataIndex: 'statusDesc' },
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
      {
        title: '物料信息',
        width: 200,
        customRender: ({ record }) => {
          return (
            <>
              <div>克重：{record?.weight || '--'}</div>
              <div>门幅：{record?.width || '--'}</div>
              <div>规格：{record?.standards || '--'}</div>
            </>
          )
        }
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
      { title: '供应商物料状态', width: 120, dataIndex: 'supplierMaterialStatusDesc' },
      { title: '供应商物料颜色', width: 160, dataIndex: 'supplierMaterialColor' },
      { title: '供应商物料色号', width: 120, dataIndex: 'supplierMaterialColorNo' },
      { title: '物料成分', width: 180, dataIndex: 'materialIngredient', ellipsis: true }
    ]

    const tableProps = reactive({
      scroll: {
        y: 400
      },
      rowKey: props.rowKey,
      emptyText: props.emptyText,
      rowSelection: true,
      size: 'small',
      columns: props.materialColumns || defaultColumns,
      dataSource: [],
      total: 0
    })

    const pages = computed({
      get: () => {
        return props.pagination
      },
      set: val => {
        emit('update:pagination', val)
        emit('search')
      }
    })

    const selectedList = computed({
      get: () => {
        return props.selectedValue
      },
      set: val => {
        emit('update:selectedValue', val)
      }
    })

    watch(
      () => props.selectedType,
      type => {
        if (type === 'radio') {
          tableProps.rowSelection = {
            type: 'radio'
          }
        } else {
          tableProps.rowSelection = true
        }
      },
      { immediate: true }
    )

    watch(
      () => [props.materialList, props.total],
      ([list, total]) => {
        tableProps.dataSource = list.map(val => {
          const images = val?.prototypeImgs || val?.imageList || val?.images || val?.fileList || val?.files || []
          return {
            ...val,
            images
          }
        })
        tableProps.total = total
      },
      { deep: true, immediate: true }
    )

    const handleSelect = (record, selected, selectedRows, nativeEvent) => {
      emit('select', record, selected, selectedRows, nativeEvent)
    }

    return {
      pages,
      selectedList,
      tableProps,
      handleSelect
    }
  }
})
</script>
