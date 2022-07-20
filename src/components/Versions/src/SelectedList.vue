<template>
  <x-table v-bind="tableProps">
    <template #bodyCell="{ text, record, index, column }">
      <slot name="bodyCell" v-bind="{ text, record, index, column }" :onDelete="handleDel">
        <template v-if="column.dataIndex === 'actions'">
          <a-button type="link" size="small" @click="handleDel(record)">删除</a-button>
        </template>
        <template v-if="column.dataIndex === 'thumbnail'">
          <x-image :width="60" :height="60" :thumbnail="record?.images?.[0]?.thumbUrl" :urls="record?.images"></x-image>
        </template>
      </slot>
    </template>
  </x-table>
</template>
<script>
import { defineComponent, reactive, watch } from 'vue'
import { XTable, XImage } from 'scm-ui-vue'

export default defineComponent({
  name: 'SelectedList',
  components: {
    'x-table': XTable,
    'x-image': XImage
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
      { title: '操作', width: 100, dataIndex: 'actions' },
      { title: '缩略图', width: 100, dataIndex: 'thumbnail' },
      {
        title: '版型编号',
        dataIndex: 'prototypeNo'
      },
      {
        title: '版型分类',
        customRender: ({ record }) => {
          return [record?.oneCategoryName, record?.twoCategoryName, record?.threeCategoryName].filter(Boolean).join('/')
        }
      },
      {
        title: '类型',
        dataIndex: 'typeDesc'
      },
      {
        title: '角色',
        dataIndex: 'styleRoleName'
      },
      {
        title: '面料类型',
        dataIndex: 'fabricsTypeDesc'
      }
    ]

    const tableProps = reactive({
      scroll: {
        y: 400
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
        tableProps.dataSource = list.map(val => {
          const images = val?.prototypeImgs || val?.imageList || val?.images || val?.fileList || val?.files || []
          return {
            ...val,
            images
          }
        })
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
